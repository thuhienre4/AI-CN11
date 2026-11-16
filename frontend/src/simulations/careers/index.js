// 3D workplace procedures, one for a job of each careers lesson.
import lathe from './lathe'
import maintenance from './maintenance'
import oilChange from './oilChange'
import pcbAssembly from './pcbAssembly'
import socket from './socket'

export const CAREER_SIMULATIONS = Object.fromEntries([maintenance, lathe, oilChange, socket, pcbAssembly].map((sim) => [sim.job, sim]))
