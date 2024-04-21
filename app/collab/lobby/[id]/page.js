'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { socket } from "../../../socket";
import Link from 'next/link';

export default function Paint() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [username, setUsername] = useState();
    const [lobbyExists, setLobbyExists] = useState(true); //chnage to empty after testing
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [guess, setGuess] = useState("Draw!!");
    const [penSize, setPenSize] = useState(8);
    const [color, setColor] = useState('#000000');
    const [prevX, setPrevX] = useState(null);
    const [prevY, setPrevY] = useState(null);
    const [timer, setTimer] = useState(false);
    const [remainingTime, setRemainingTime] = useState();
    const [gameState, setGameState] = useState("waiting to start"); // waiting, drawing, guessing
    const [customWords, setCustomWords] = useState([]);
    const [useOnlyCustomWords, setUseOnlyCustomWords] = useState(false);
    const [timerTime, setTimerTime] = useState(15);
    const [prompt, setPrompt] = useState();
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const isMounted = useRef(true);
    const params = useParams();

    function joinCollaborativeCanvas() {
        socket.emit("joinCollaborativeCanvas", username, params.id);
        socket.on("joinedCollaborativeCanvas", (data) => {
            setJoinedLobby(true);
            console.log("current drawing is ", data);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create a new Image object
            const img = new Image();

            // Set the crossOrigin property to allow drawing the image on the canvas
            img.crossOrigin = "Anonymous";

            // Draw the image on the canvas once it has loaded
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };

            img.src = data;
        })
    }

    function choosePrompt() {
        let prompts = ["cat", "dog", "house", "tree", "car", "apple", "banana", "computer", "phone", "book", "chair", "table", "flower", "sun", "moon", "star", "cloud", "mountain", "river", "ocean", "beach", "desert", "forest", "city", "country", "school", "hospital", "restaurant", "store", "park", "garden", "zoo", "museum", "library", "movie", "sport", "food", "drink", "animal", "plant", "insect", "fish", "bird", "reptile"];
        if (customWords.length !== 0) {
            let customSplit = customWords[0].split(" ")
            prompts = useOnlyCustomWords ? customSplit : prompts.concat(customSplit);
        }
        const randomIndex = Math.floor(Math.random() * prompts.length);
        setPrompt(prompts[randomIndex]);
    }

    function startRound() {
        clearCanvas();
        choosePrompt();
        setTimer(true);
        setRemainingTime(timerTime);
        setGameState("drawing");
        const intervalId = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(intervalId); // Clear the interval when time is up
                    return 0;
                } else {
                    return prevTime - 1;
                }
            });
        }, 1000); // Decrease every second
        setTimeout(() => {
            if (isMounted.current) {
                guessDrawing();
            }
            setTimer(false);
            setRemainingTime(null);
        }, timerTime * 1000); // After timerTime seconds, stop the timer
    }

    function updateSettings() {
        setTimer();
    }

    async function guessDrawing() {
        setGuess("AI is guessing...");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = canvas.toDataURL('image/png');
        const response = await fetch("/api/guess_image", {
            "body": JSON.stringify({ 'image': image, 'username': username }),
            "method": "POST"
        });
        let data = await response.json();
        console.log(data.guess);
        setGuess(`AI guessed: ${data.guess}`);
    }

    function copyUrlToClipboard(event) {
        const url = window.location.href;

        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);

        tempInput.select();
        tempInput.setSelectionRange(0, 99999);

        document.execCommand('copy');
        document.body.removeChild(tempInput);

        event.target.innerText = 'Copied Link to Clipboard!';

        setTimeout(function () {
            event.target.innerText = 'Copy Invite Link';
        }, 2000);
    }

    useEffect(() => {
        function checkIfLobbyIdValid() {
            socket.emit("checkCollaborativeCanvasLobbyExists", params.id);
            socket.on('lobbyFound', (data) => {
                console.log(`received value ${data} after checking if lobby exists`);
                // CHANGE THIS TO 'data' AFTER TESTING
                setLobbyExists(true);
            })
        }

        const updateCollaborativeCanvas = (data) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.penSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(data.prevX, data.prevY);
            ctx.lineTo(data.x, data.y);
            ctx.stroke();
        }

        const clearCanvasForAll = (data) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const handleLobbyUserUpdate = (data) => {
            console.log("received update", data);
            setConnectedUsers(data);
        };

        checkIfLobbyIdValid();

        socket.on("updateCollaborativeCanvas", updateCollaborativeCanvas);
        socket.on("collaborativeCanvasUserUpdate", handleLobbyUserUpdate);
        socket.on("clearCanvasForAll", clearCanvasForAll);

        // Clean up the event listener when the component unmounts
        return () => {
            socket.off("updateCollaborativeCanvas", updateCollaborativeCanvas);
            socket.off("collaborativeCanvasUserUpdate", handleLobbyUserUpdate);
            socket.off("clearCanvasForAll", clearCanvasForAll);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) return;

        const startDrawing = (e) => {
            setIsDrawing(true);
            const x = e.clientX - canvas.offsetLeft;
            const y = e.clientY - canvas.offsetTop;
            setPrevX(x);
            setPrevY(y);
        };

        const stopDrawing = () => {
            setIsDrawing(false);
            setPrevX(null);
            setPrevY(null);
        };

        const draw = (e) => {
            if (!isDrawing) return;
            const x = e.clientX - canvas.offsetLeft;
            const y = e.clientY - canvas.offsetTop;
            console.log(y, "offset: ", canvas.offsetTop);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = penSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
            setPrevX(x);
            setPrevY(y);

            socket.emit('drawingData', {
                prevX,
                prevY,
                x,
                y,
                color,
                penSize
            },
                canvas.toDataURL(),
                params.id
            );
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
        };
    }, [isDrawing, penSize, color, prevX, prevY]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clearCanvas', params.id);
    };

    return (
        <div className='bg-gradient-to-br from-[#998cb4] to-[#29162a] text-black h-screen font-mono'>
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
                            <label tabIndex="0" className={`btn btn-ghost hover:bg-transparent`}>
                                Home
                            </label>
                        </Link>
                        <Link
                            href='/gameMaster'
                        >
                            <label tabIndex="0" className={`btn btn-ghost hover:bg-transparent `}>
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
                <div className="navbar-end">
                    <button className="btn btn-ghost bg-indigo-200 text-black hover:bg-indigo-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5" viewBox="0 0 20 20" fill="black">
                            <path fillRule='evenodd' clipRule="evenodd" d="M7.53 15.848L15.53 10.848C16.1567 10.4563 16.1567 9.54368 15.53 9.15201L7.53 4.15201C6.86395 3.73573 6 4.21458 6 5.00001L6 15C6 15.7854 6.86395 16.2643 7.53 15.848ZM8 13.1958L8 6.80426L13.1132 10L8 13.1958Z" fill="#000000" />
                        </svg>
                        <p className=""> Play </p>
                    </button>
                </div>
            </div>

            {/* NavBar Ends Here */}
            {lobbyExists
                ?
                <div id='lobby-exists' className='text-left flex justify-start pt-20 gap-20 mx-20'> 
                    <div className="text-black pt-20 items-center w-48 pl-3"> {/* Left Column */}

                        <button className='bg-gray-300 rounded-md px-5 py-2 duration-200 hover:bg-gray-400' onClick={startRound}>Start Round</button>
                        <div className='mt-20 border-sm border-black bg-gray-100 rounded-md'>
                            {prompt && (
                                <div className="border-b border-black">
                                    <p className='text-xl p-2'>Draw a {prompt}</p>
                                </div>
                            )}
                            {guess && ( 
                                <div className="border-b border-black">
                                    <p className={`text-xl p-2 animate-pulse ${prompt && guess.toLowerCase().includes(prompt.toLowerCase()) ? 'text-green-500' : ""}`}>{guess}</p>
                                </div>
                            )}
                            {remainingTime && (
                                <div>
                                {remainingTime < 5 ? 
                                    <span><p className="text-xl text-red-500">{remainingTime}</p> seconds remaining</span> 
                                    : <p className="text-xl">{remainingTime} seconds remaining</p>
                                }
                                </div>
                            )}
                        </div>
                    </div>
                    <div> {/* Canvas Middle Column */}
                        <div className="row mt-3 pl-10">
                            <div className='grid grid-cols-2 w-full justify-between'>
                                {!joinedLobby &&
                                    <div className='pb-4'>
                                        <input placeholder='username' className='px-5 py-2 border-none bg-white text-black rounded-l-md' onChange={(e) => setUsername(e.target.value)}></input>
                                        <button className='bg-gray-300 px-5 py-2 duration-200 rounded-r-md hover:bg-gray-400' onClick={joinCollaborativeCanvas}>Join Lobby</button>
                                    </div>
                                }
                                <div>
                                    <button className='bg-gray-300  px-5 py-2 mb-3 rounded-md duration-200 hover:bg-gray-400' onClick={copyUrlToClipboard} onMouseEnter={(event) => {event.target.innerText = window.location.href}} onMouseLeave={(event) => {event.target.innerText = 'Copy Invite Link'}}>Copy Invite Link</button>
                                </div>
                            </div>
                            <div className='canvas w-full '>
                                <canvas ref={canvasRef} width={800} height={600} className='bg-white rounded-md border-black hover:cursor-crosshair'></canvas>
                                <div className='flex flex-row items-center gap-32 mt-4'>
                                    <div className="colors relative" data-tooltip="Left-/Rightclick to choose a color!" data-tooltipdir="S">
                                            <div className="top flex ">
                                                <div className=" rounded-tl-sm color bg-white  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#FFFFFF")}></div>
                                                <div className="color bg-gray-400  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#9ca3af")}></div>
                                                <div className="color bg-red-500  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#ef4444")}></div>
                                                <div className="color bg-orange-500  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#f97316")}></div>
                                                <div className="color bg-yellow-400  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#facc15")}></div>
                                                <div className="color bg-green-500  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#22c55e")}></div>
                                                <div className="color bg-green-300  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#86efac")}></div>
                                                <div className="color bg-blue-400  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#5DE2E7")}></div>
                                                <div className="color bg-blue-700  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#1d4ed8")}></div>
                                                <div className="color bg-purple-500  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#a855f7")}></div>
                                                <div className="color bg-pink-500  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#ec4899")}></div>
                                                <div className="color bg-pink-200  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#fbcfe8")}></div>
                                                <div className="rounded-tr-sm color bg-[#bfa094]  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#bfa094")}></div>
                                            </div>
                                            <div className="bottom flex rounded-b-2">
                                                <div className=" rounded-bl-sm color bg-black  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#000000")}></div>
                                                <div className="color bg-gray-600  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#4b5563")}></div>
                                                <div className="color bg-red-800  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#991b1b")}></div>
                                                <div className="color bg-orange-600  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#ea580c")}></div>
                                                <div className="color bg-yellow-600  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#ca8a04")}></div>
                                                <div className="color bg-green-800  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#166534")}></div>
                                                <div className="color bg-green-600  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#16a34a")}></div>
                                                <div className="color bg-blue-600  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#2563eb")}></div>
                                                <div className="color bg-indigo-900  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#312e81")}></div>
                                                <div className="color bg-purple-900  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#581c87")}></div>
                                                <div className="color bg-purple-700  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#7e22ce")}></div>
                                                <div className="color bg-orange-500  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#f97316")}></div>
                                                <div className=" rounded-br-sm color bg-[#977669]  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125 hover:rounded-md" onClick={(e) => setColor("#977669")}></div>
                                                {/* <div className="color bg-[#43302b]  duration-200 hover:cursor-grab h-6 w-6 hover:scale-125" onClick={(e) => setColor("#43302b") }></div> */}
                                            </div>
                                    </div>
                                    <div className="flex flex-row gap-3  p-2 items-center ">
                                        <div className={`color duration-200 cursor-grab h-2 w-2 rounded-full hover:scale-125 ${penSize === 4 ? 'bg-black' : 'bg-gray-500'}`} onClick={(e) => setPenSize(4)}></div>
                                        <div className={`color duration-200 cursor-grab h-4 w-4 rounded-full hover:scale-125 ${penSize === 8 ? 'bg-black' : 'bg-gray-500'}`} onClick={(e) => setPenSize(8)}></div>
                                        <div className={`color duration-200 cursor-grab h-6 w-6 rounded-full hover:scale-125 ${penSize === 10 ? 'bg-black' : 'bg-gray-500'}`} onClick={(e) => setPenSize(10)}></div>
                                        <div className={`color duration-200 cursor-grab h-8 w-8 rounded-full hover:scale-125 ${penSize === 15 ? 'bg-black' : 'bg-gray-500'}`} onClick={(e) => setPenSize(15)}></div>
                                    </div>
                                    <button onClick={clearCanvas} className='bg-gray-300 px-5 py-2 rounded-sm duration-200 hover:cursor-grab hover:bg-gray-400 '>Clear</button>

                                </div>
                            </div>
                           
                            {/* )} */}
                        </div>
                    </div>
                    <div className='mt-[100px] w-full flex flex-col items-center mb-auto'>
                    {connectedUsers.length > 0 ?
                        <h1 className='text-center w-full px-4 py-2 bg-gray-300 rounded-t-md'>Connected:</h1>
                        :
                        <h1 className='text-center w-full px-4 py-2 bg-gray-200 rounded-md'>No One Joined Yet!</h1>
                    }
                    <div className="grid grid-cols-1 w-full">
                        {connectedUsers.map((user, index) => (
                            <div key={index} className={`text-black ${index === connectedUsers.length - 1 ? 'rounded-b-md' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} w-full`}>
                                <h1 className='px-3 py-2'>{user}</h1>
                            </div>
                        ))}
                    </div>
                </div>


                    <div>
                        <div id='settings' className="absolute top-0 right-0">
                            <svg onClick={() => setShowSettingsModal(true)} className='hover:scale-125  hover:rotate-45 duration-300 hover:cursor-grab mt-24 mr-10' fill='#9ca3af' height={60} version="1.1" viewBox="0 0 512 512" width={60} xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M424.5,216.5h-15.2c-12.4,0-22.8-10.7-22.8-23.4c0-6.4,2.7-12.2,7.5-16.5l9.8-9.6c9.7-9.6,9.7-25.3,0-34.9l-22.3-22.1  c-4.4-4.4-10.9-7-17.5-7c-6.6,0-13,2.6-17.5,7l-9.4,9.4c-4.5,5-10.5,7.7-17,7.7c-12.8,0-23.5-10.4-23.5-22.7V89.1  c0-13.5-10.9-25.1-24.5-25.1h-30.4c-13.6,0-24.4,11.5-24.4,25.1v15.2c0,12.3-10.7,22.7-23.5,22.7c-6.4,0-12.3-2.7-16.6-7.4l-9.7-9.6  c-4.4-4.5-10.9-7-17.5-7s-13,2.6-17.5,7L110,132c-9.6,9.6-9.6,25.3,0,34.8l9.4,9.4c5,4.5,7.8,10.5,7.8,16.9  c0,12.8-10.4,23.4-22.8,23.4H89.2c-13.7,0-25.2,10.7-25.2,24.3V256v15.2c0,13.5,11.5,24.3,25.2,24.3h15.2  c12.4,0,22.8,10.7,22.8,23.4c0,6.4-2.8,12.4-7.8,16.9l-9.4,9.3c-9.6,9.6-9.6,25.3,0,34.8l22.3,22.2c4.4,4.5,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l9.7-9.6c4.2-4.7,10.2-7.4,16.6-7.4c12.8,0,23.5,10.4,23.5,22.7v15.2c0,13.5,10.8,25.1,24.5,25.1h30.4  c13.6,0,24.4-11.5,24.4-25.1v-15.2c0-12.3,10.7-22.7,23.5-22.7c6.4,0,12.4,2.8,17,7.7l9.4,9.4c4.5,4.4,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l22.3-22.2c9.6-9.6,9.6-25.3,0-34.9l-9.8-9.6c-4.8-4.3-7.5-10.2-7.5-16.5c0-12.8,10.4-23.4,22.8-23.4h15.2  c13.6,0,23.3-10.7,23.3-24.3V256v-15.2C447.8,227.2,438.1,216.5,424.5,216.5z M336.8,256L336.8,256c0,44.1-35.7,80-80,80  c-44.3,0-80-35.9-80-80l0,0l0,0c0-44.1,35.7-80,80-80C301.1,176,336.8,211.9,336.8,256L336.8,256z" /></svg>
                            {showSettingsModal && (
                                <>
                                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                                                    <h3 className="text-3xl font-semibold">Settings</h3>
                                                    <button
                                                        className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                                        onClick={() => setShowSettingsModal(false)}
                                                    >
                                                        <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">×</span>
                                                    </button>
                                                </div>
                                                <div className="relative p-6 flex-auto">
                                                    <div>
                                                        <label>Timer Seconds: </label>
                                                        <input type="number" className="bg-white border border-gray-300" value={timerTime} onChange={(e) => setTimerTime(e.target.value)} />
                                                    </div>
                                                    <div className="flex flex-col mt-2">
                                                        <label>Custom Words: </label>
                                                        <textarea rows="4" className='bg-white border border-gray-300 overflow-y-scroll' placeholder="lion dog bear tiger" value={customWords} onChange={(e) => setCustomWords([e.target.value])}></textarea>
                                                    </div>
                                                    <div className="mt-2">
                                                        <label>Only Custom Words: </label>
                                                        <input type="checkbox" className="border border-gray-300" checked={useOnlyCustomWords} onChange={(e) => setUseOnlyCustomWords(e.target.checked)} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
                                                    <button
                                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                                                        type="button"
                                                        style={{ transition: "all .15s ease" }}
                                                        onClick={() => setShowSettingsModal(false)}
                                                    >
                                                        Close
                                                    </button>
                                                    <button
                                                        className="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1"
                                                        type="button"
                                                        style={{ transition: "all .15s ease" }}
                                                        onClick={() => setShowSettingsModal(false)}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                :
                <div>
                    bad
                </div>
            }
        </div>
    );
}