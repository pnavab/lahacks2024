'use client'

import Link from "next/link";
import { socket } from "../socket";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
    const [recommendationResponse, setRecommendationResponse] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    function createLobby() {
        socket.emit("createLobby");
        socket.on('lobbyCreated', (data) => {
            console.log('created lobby, id:', data);
            router.push(`/lobby/${data}`)
        });
    }

    const handleFocus = () => {
      setIsFocused(true);
    };
    const handleBlur = () => {
      setIsFocused(false);
    };

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
        console.log(typeof (data));
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
            }, 5000);
        }
        else if (data == "2") {
            setRecommendationResponse("A team player! I have selected a collaborative drawing game where all players will draw and try to beat the clock.")
            setTimeout(() => {
                socket.emit("createCollaborativeCanvasLobby");
                socket.on('collaborativeCanvasLobbyCreated', (data) => {
                    console.log('created lobby, id:', data);
                    router.push(`/collab/lobby/${data}`)
                });
            }, 5000);
        }
        else if (data == "3") {
            setRecommendationResponse("You seem to be a competitive person! I have selected a drawing game where you will compete against other players, racing against the clock.");
            setTimeout(() => {
                socket.emit("createSoloCanvasLobby");
                socket.on('soloCanvasLobbyCreated', (data) => {
                    console.log('created lobby, id:', data);
                    router.push(`/versus/lobby/${data}`)
                });
            }, 5000);
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
                            SketchBox
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
            </div>
            {/* <div className="bg-gradient-to-br from-stone-800 via-purple-500 to-stone-600 h-screen w-full"> */}
              <div className="bg-[#23374d] pl-4 pt-44 text-center h-screen w-full">
                  <p className="text-7xl font-bold"> Game Master </p>
                  <p className="text-xl mt-2">Enjoy the next frontier of gaming with the power of AI at your fingertips.</p>
                  <div className="flex justify-center text-center pt-4 mt-4">
                      <input
                        placeholder={isFocused ? 'What game vibe do you want to experience?                               ↵ ' : 'Interact'}
                        // onFocus={handleFocus}
                        onMouseEnter={handleFocus}
                        onMouseLeave={handleBlur}
                        // onBlur={handleBlur}
                        onKeyDown={handleEnter}
                        onChange={(e) => { setUserInput(e.target.value) }}
                        className='border-2 border-white placeholder-[#585857] font-bold text-black mt-5 w-[12%] h-11 rounded-full text-xl hover:w-1/2 duration-150 ease-in-out py-4 bg-[#99ddf1] hover:rounded-3xl hover:h-16 hover:bg-gradient-to-t hover:from-[#88c9dd] hover:to-[#acdae7] text-center px-3' />
                  </div>
                  {/* Response */}
                  <textarea rows={4} disabled placeholder={`${recommendationResponse}`} className="border-2 border-white text-white font-bold text-2xl text-left w-1/2 py-10 px-4 mt-20 rounded-lg before:absolute before:inset-0 before:animate-typewriter before:bg-stone-800 after:absolute after:inset-0 after:w-[0.125em] after:animate-caret" />
              </div>
            {/* </div> */}
        </main>
    );
}
