'use client'

import Link from "next/link";
import { socket } from "../socket";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
    const [recommendationResponse, setRecommendationResponse] = useState('');
    const [userInput, setUserInput] = useState('');
    const router = useRouter();

    function createLobby() {
        socket.emit("createLobby");
        socket.on('lobbyCreated', (data) => {
            console.log('created lobby, id:', data);
            router.push(`/lobby/${data}`)
        });
    }

    async function getRecommendation() {
        setRecommendationResponse('Thinking...');
        const response = await fetch("http://localhost:8000/game_master", {
            "body": JSON.stringify({ 'message': userInput }),
            "headers": {
                "Content-Type": "application/json"
            },
            "method": "POST"
        });
        let data = await response.json();
        data = data[0];
        console.log(typeof(data));
        if (data == "0") {
            setRecommendationResponse("Your input wasn't very clear, please try again.")
        }
        else if (data == "1") {
            setRecommendationResponse("My curated pick for you: an AI powered story generator collaborative game.");
            setTimeout(() => {
                socket.emit("createLobby");
                socket.on('lobbyCreated', (data) => {
                    console.log('created lobby, id:', data);
                    router.push(`/story/lobby/${data}`)
                });
            } , 5000);
          }
          else if (data == "2") {
            setRecommendationResponse("A team player! I have selected a collaborative drawing game where all players will draw and try to beat the clock.")
            setTimeout(() => {
              socket.emit("createCollaborativeCanvasLobby");
              socket.on('collaborativeCanvasLobbyCreated', (data) => {
                  console.log('created lobby, id:', data);
                  router.push(`/collab/lobby/${data}`)
              });
            } , 5000);
          }
          else if (data == "3") {
            setRecommendationResponse("You seem to be a competitive person! I have selected a drawing game where you will compete against other players, racing against the clock.");
            setTimeout(() => {
              socket.emit("createSoloCanvasLobby");
              socket.on('soloCanvasLobbyCreated', (data) => {
                  console.log('created lobby, id:', data);
                  router.push(`/versus/lobby/${data}`)
              });
            } , 5000);
        }
        else {
            setRecommendationResponse("I could not process your request :( Please try again.")
        }
    }

    function handleEnter(e) {
        if (e.key === 'Enter') {
            getRecommendation();
        }
    }

    function createCollaborativeCanvasLobby() {
        socket.emit("createCollaborativeCanvasLobby");
        socket.on('collaborativeCanvasLobbyCreated', (data) => {
            console.log('created lobby, id:', data);
            router.push(`/collab/lobby/${data}`)
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
                            href='/'
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
                        <ul tabIndex="0" className="menu menu-compact dropdown-content  shadow-lg  rounded-box w-52 bg-black bg-opacity-15 text-white">
                            <li><a>Gamemode1</a></li>
                            <li><a>Gamemode2</a></li>
                            <li><a>GAMEMODE3!!</a></li>
                        </ul>
                    </div>
                </div>
                <div className="navbar-end">
                    <button className="btn btn-ghost bg-indigo-200 text-black hover:bg-indigo-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5" viewBox="0 0 20 20" fill="black">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.53 15.848L15.53 10.848C16.1567 10.4563 16.1567 9.54368 15.53 9.15201L7.53 4.15201C6.86395 3.73573 6 4.21458 6 5.00001L6 15C6 15.7854 6.86395 16.2643 7.53 15.848ZM8 13.1958L8 6.80426L13.1132 10L8 13.1958Z" fill="#000000" />
                        </svg>
                        <p className=""> Play </p>
                    </button>
                </div>
            </div>
            <div className="bg-stone-800 font-mono pl-4 pt-44 text-center h-screen w-full">
                <p className="text-7xl font-bold"> Game Master </p>
                <div className="flex justify-center text-center pt-4 ">
                    <input placeholder={'What Game do You want to Experience                            ↵ '} onKeyDown={handleEnter} onChange={(e) => {setUserInput(e.target.value)}} className='w-1/2 py-4 rounded-full bg-black text-right pr-6' />
                </div>
                {/* Response */}
                <textarea rows={4} disabled placeholder={`${recommendationResponse}`} className="text-left w-1/2 py-10 px-4 mt-20 rounded-lg" />
            </div>
        </main>
    );
}
