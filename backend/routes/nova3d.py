import asyncio
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from config import settings
from auth import get_authenticated_user, require_teacher_user
from models import User


router = APIRouter(prefix="/api/nova3d", tags=["Nova3D"])

SKETCH_TO_3D_WORKFLOW = "sketch_to_3d"
SKETCH_TO_3D_RETURN_NODE = "sketch_to_3d_generator"


FOUR_STROKE_ENGINE_PROMPT = """
Create a structured, editable GLB model for a Vietnamese Grade 11 Technology textbook lesson:
"Nguyen ly lam viec cua dong co dot trong 4 ki".

Model an educational cutaway four-stroke internal combustion engine with separate named parts:
- cylinder block and transparent cylinder wall
- piston
- connecting rod
- crankshaft and crank web
- intake valve and intake port
- exhaust valve and exhaust port
- spark plug
- combustion chamber
- arrows for gas flow and crank rotation
- labels or distinct materials for the four textbook strokes:
  1. Ki nap: piston moves down, intake valve opens, fresh charge enters cylinder.
  2. Ki nen: piston moves up, both valves closed, mixture is compressed.
  3. Ki chay - gian no: spark plug ignites, gas expands, piston moves down and produces work.
  4. Ki thai: piston moves up, exhaust valve opens, exhaust gas leaves cylinder.

Requirements:
- Preserve semantic part names in the scene graph.
- Keep parts separated and editable, not a single merged mesh.
- Use simple textbook-style colors, clean geometry, and no decorative background.
- Prioritize correct working principle over visual complexity.
- The model must be suitable for a classroom interactive 3D simulation.
""".strip()


class Nova3DGenerateRequest(BaseModel):
    prompt: Optional[str] = None
    wait_for_result: bool = False


class Nova3DWorkflowResponse(BaseModel):
    configured: bool
    workflow_id: Optional[str] = None
    glb_url: Optional[str] = None
    status: str
    message: str
    prompt: str
    raw: Optional[dict[str, Any]] = None


def _is_configured() -> bool:
    return bool(settings.nova3d_auth_token and settings.nova3d_provider_api_key)


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.nova3d_auth_token}",
        "Content-Type": "application/json",
    }


def _base_url() -> str:
    return settings.nova3d_base_url.rstrip("/")


def _extract_node_payload(data: dict[str, Any]) -> Optional[dict[str, Any]]:
    for key in [
        "sketch_to_3d_generator",
        "regenerate_3d_part",
        "add_3d_part",
        "articulate_3d_model",
    ]:
        node = data.get(key)
        if isinstance(node, list) and node and isinstance(node[0], dict):
            return node[0]
    return data


def _extract_glb_url(data: dict[str, Any]) -> Optional[str]:
    payload = _extract_node_payload(data)
    if not payload:
        return None

    result = payload.get("result") if isinstance(payload.get("result"), dict) else payload
    for key in ["model_url", "glb_url", "url"]:
        value = result.get(key)
        if isinstance(value, str) and value:
            return value

    for artifact_key in ["model", "model_artifact"]:
        artifact = result.get(artifact_key)
        if isinstance(artifact, dict):
            value = artifact.get("url")
            if isinstance(value, str) and value:
                return value
    return None


async def _nova_request(method: str, path: str, **kwargs):
    async with httpx.AsyncClient(base_url=_base_url(), timeout=300) as client:
        response = await client.request(method, path, headers=_headers(), **kwargs)
    if response.status_code >= 400:
        detail = response.text
        try:
            detail = response.json().get("detail") or response.json().get("message") or detail
        except ValueError:
            pass
        raise HTTPException(status_code=response.status_code, detail=f"Nova3D API error: {detail}")
    return response.json()


@router.get("/config")
async def get_nova3d_config(_current_user: User = Depends(get_authenticated_user)):
    return {
        "configured": _is_configured(),
        "base_url": settings.nova3d_base_url,
        "provider": settings.nova3d_provider,
        "llm": settings.nova3d_llm,
    }


@router.post("/four-stroke-engine", response_model=Nova3DWorkflowResponse)
async def generate_four_stroke_engine(
    request: Nova3DGenerateRequest,
    _current_user: User = Depends(require_teacher_user),
):
    prompt = (request.prompt or FOUR_STROKE_ENGINE_PROMPT).strip()
    if not _is_configured():
        return Nova3DWorkflowResponse(
            configured=False,
            status="fallback",
            message="Nova3D is not configured. Set ENGINE_LAB_NOVA3D_AUTH_TOKEN and ENGINE_LAB_NOVA3D_PROVIDER_API_KEY.",
            prompt=prompt,
        )

    readiness = await _nova_request("GET", f"/workflow/readiness/{SKETCH_TO_3D_WORKFLOW}")
    if readiness.get("ready") is not True:
        return Nova3DWorkflowResponse(
            configured=True,
            status="not_ready",
            message=readiness.get("reason") or "Nova3D generation is not ready.",
            prompt=prompt,
            raw=readiness,
        )

    request_id = f"engine-four-stroke-{asyncio.get_running_loop().time():.6f}".replace(".", "-")
    started = await _nova_request(
        "POST",
        f"/run/state/{SKETCH_TO_3D_WORKFLOW}",
        params={"request_id": request_id},
        json={
            "payload": {
                "prompt": prompt,
                "llm": settings.nova3d_llm,
                "provider": settings.nova3d_provider,
                "api_key": settings.nova3d_provider_api_key,
                "validate": False,
            },
            "return_nodes": [SKETCH_TO_3D_RETURN_NODE],
        },
    )
    workflow_id = started.get("workflow_id")
    if not workflow_id:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Nova3D did not return a workflow_id.",
        )

    if not request.wait_for_result:
        return Nova3DWorkflowResponse(
            configured=True,
            workflow_id=workflow_id,
            status="started",
            message="Nova3D generation started.",
            prompt=prompt,
            raw=started,
        )

    for _ in range(80):
        await asyncio.sleep(3)
        workflow_status = await _nova_request("GET", f"/status/{workflow_id}")
        runtime = workflow_status.get("runtime", {})
        state = str(runtime.get("state", "")).lower()
        last_node = runtime.get("last_exit_node_id")
        if state in {"completed", "succeeded", "success"} or last_node in {"success_final", "success_original_glb"}:
            break
        if state in {"failed", "terminated", "cancelled", "timed_out", "timeout", "budget_exhausted"}:
            return Nova3DWorkflowResponse(
                configured=True,
                workflow_id=workflow_id,
                status=state,
                message="Nova3D generation ended without a completed model.",
                prompt=prompt,
                raw=workflow_status,
            )

    result = await _nova_request("GET", f"/result/{workflow_id}")
    return Nova3DWorkflowResponse(
        configured=True,
        workflow_id=workflow_id,
        glb_url=_extract_glb_url(result),
        status="completed",
        message="Nova3D generation completed.",
        prompt=prompt,
        raw=result,
    )


@router.get("/workflows/{workflow_id}/status")
async def get_workflow_status(workflow_id: str, _current_user: User = Depends(require_teacher_user)):
    if not _is_configured():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nova3D is not configured.")
    return await _nova_request("GET", f"/status/{workflow_id}")


@router.get("/workflows/{workflow_id}/result")
async def get_workflow_result(workflow_id: str, _current_user: User = Depends(require_teacher_user)):
    if not _is_configured():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nova3D is not configured.")
    result = await _nova_request("GET", f"/result/{workflow_id}")
    return {
        "workflow_id": workflow_id,
        "glb_url": _extract_glb_url(result),
        "raw": result,
    }
