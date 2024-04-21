'use client'

import Link from "next/link";
import { socket } from "./socket";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  function createStoryLobby() {
    socket.emit("createLobby");
    socket.on('lobbyCreated', (data) => {
      console.log('created lobby, id:', data);
      router.push(`/story/lobby/${data}`)
    });
  }

  function createCollaborativeCanvasLobby() {
    socket.emit("createCollaborativeCanvasLobby");
    socket.on('collaborativeCanvasLobbyCreated', (data) => {
      console.log('created lobby, id:', data);
      router.push(`/collab/lobby/${data}`)
    });
  }

  function createVersusLobby() {
    socket.emit("createSoloCanvasLobby");
    socket.on('soloCanvasLobbyCreated', (data) => {
      console.log('created lobby, id:', data);
      router.push(`/versus/lobby/${data}`)
    });
  }

  return (
    <main className="grow min-h-screen flex-col bg-black">
      {/* navbar */}
      <div className="navbar fixed top-2 left-0 right-0 shadow-lg border-none bg-transparent text-white z-10">
        <div className="navbar-start">
          <div className="navbar-center">
            <Link href='/' className="btn btn-ghost normal-case text-xl hover:bg-transparent hover:text-gray-300 duration-300" > 
              Ai Dungeon
            </Link> 
          </div>
          <div className="dropdown">
            <Link
              href='/'
            >
              <label tabIndex="0" className={`btn btn-ghost hover:bg-transparent ${window.location.pathname == '/' ? 'border-b-indigo-200 border-b-4 hover:border-b-indigo-200 hover:border-b-4' : ''} `}>
                Home
              </label>
            </Link>
            <Link
              href='/gameMaster'
            >
              <label tabIndex="0" className={`btn btn-ghost hover:bg-transparent ${window.location.pathname == '/gameMaster' ? 'border-b-indigo-200 border-b-4 hover:border-b-indigo-200 hover:border-b-4' : ''} `}>
                Game Master
              </label>
            </Link>
          </div>
          <div className="dropdown">
            <label tabIndex="0" className="btn btn-ghost bg-transparent hover:bg-transparent">
              Games
            </label>
            <ul tabIndex="0" className="menu menu-compact dropdown-content  shadow-lg  bg-opacity-15 rounded-box w-52 bg-black text-white">
              <li><a>Gamemode1</a></li>
              <li><a>Gamemode2</a></li>
              <li><a>GAMEMODE3!!</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-stone-800 pl-4 h-screen grid grid-cols-1 ">
        <div className='pt-44'>
          <h1 class="relative w-[max-content] font-mono before:absolute before:inset-0 before:animate-typewriter before:bg-stone-800  after:absolute after:inset-0 after:w-[0.125em] after:animate-caret after:bg-black text-7xl py-2"><p className=' text-slate-500'> AI</p>Powered Gaming</h1>
        </div>
        <div className=" animate-fadeIn delay-500">
          <button onClick={() => {router.push('/gameMaster')}} className="bg-gradient-to-r from-indigo-300 to-indigo-100  text-black hover:from-indigo-200 hover:to-indigo-50 duration-300 flex p-4 rounded-xl text-4xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10" viewBox="0 0 20 20" fill="black">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.53 15.848L15.53 10.848C16.1567 10.4563 16.1567 9.54368 15.53 9.15201L7.53 4.15201C6.86395 3.73573 6 4.21458 6 5.00001L6 15C6 15.7854 6.86395 16.2643 7.53 15.848ZM8 13.1958L8 6.80426L13.1132 10L8 13.1958Z" fill="#000000" />
            </svg>
            <p className="pl-2"> Start Your Experience  </p>
          </button>
        </div>
        <div className="pt-24  text-left duration-700">
          <div className=" w-full pr-4 flex justify-between gap-4" >
            <div className="card w-96    text-black ">
              <div className="card-body">
                <div className="card-actions justify-end">
                <button
                    className="w-full text-xl bg-white bg-opacity-5 text-white px-8 py-4  animate-fadeIn delay-200  hover:bg-opacity-0 duration-300 rounded-2xl "
                    onClick={createStoryLobby}
                  >
                    Storytelling mode
                    <p className="text-sm">
                      Join friends to play a guessing game... with Ai
                    </p>
                  </button>
                </div>
              </div>
            </div>
            <div className="card w-96    text-black " >
              <div className="card-body">
                <div className="card-actions justify-end">
                <button
                    className="w-full text-xl bg-white bg-opacity-5 text-white px-8 py-4  animate-fadeIn delay-200  hover:bg-opacity-0 duration-300 rounded-2xl "
                    onClick={createCollaborativeCanvasLobby}
                  >
                    Collaborative AI Drawing
                    <p className="text-sm">
                      Join friends to play a guessing game... with Ai
                    </p>
                  </button>
                </div>
              </div>
            </div>
            <div className="card w-96    text-black ">
              <div className="card-body">
                <div className="card-actions justify-end">
                <button
                    className="w-full text-xl bg-white bg-opacity-5 text-white px-8 py-4  animate-fadeIn delay-200 hover:bg-opacity-0 duration-300 rounded-2xl "
                    onClick={createVersusLobby}
                  >
                    Versus AI Drawing 
                    <p className="text-sm">
                      Join friends to play a guessing game... with Ai
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
