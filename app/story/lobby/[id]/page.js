"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "../../../socket";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function Home() {
    const [lobbyID, setLobbyID] = useState(null);
    const [connectedUsers, setConnectedUsers] = useState(["Joe"]);
    const [username, setUsername] = useState();
    const [lobbyExists, setLobbyExists] = useState(true); //chnage to empty after testing
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [qrCode, setQrCode] = useState();

    const router = useRouter();
    const params = useParams();

    const [avatarText, setAvatarText] = useState('')
    const [isLobbyTime, setIsLobbyTime] = useState(false)
    const [isStoryTime, setIsStoryTime] = useState(false)
    const [storyText, setStoryText] = useState('')
    const [story, setStory] = useState('')

    function assignAvatar() {

        // Generate Image here Et here

        // if (avatarText !== '') {
        //     setIsLobbyTime(false)
        //     setIsStoryTime(true)
        // }

        console.log("in assignAvatar button")
        console.log('button clicked', avatarText)

        socket.emit("updateAvatar", username, params.id, avatarText)
    }

    function genImageWithText() {

        // Gen Story Image here Et here

        console.log("in genImageWithText button")
        console.log('genImageWithText button clicked', storyText)

        socket.emit("updateStory", username, params.id, storyText)
    }

    function joinLobby() {
        setIsLobbyTime(true)
        // todo: check if username is already taken
        socket.emit("joinLobby", username, params.id, null);
        socket.on('lobbyJoined', (data) => {
            console.log("joined lobby")
            setJoinedLobby(true);
        });
    }

    function startStoryMode() {
        setIsLobbyTime(false)
        setIsStoryTime(true)
    }


    useEffect(() => {
        function checkIfLobbyIdValid() {
            console.log(params.id);
            socket.emit("checkLobbyExists", params.id);
            socket.on('lobbyFound', (data) => {
                console.log(`received value ${data} after checking if lobby exists`);
                // CHANGE THIS TO DATA AFTER TESTING
                setLobbyExists(true);
            })
        }

        async function generateQrCode() {
            const response = await fetch("/api/qr", {
                "body": JSON.stringify({ domain: window.location.href }),
                "method": "POST"
            });
            let data = await response.json();
            console.log("full response is", data);
            const svgLink = data.imageUrl;
            console.log(svgLink);
            setQrCode(svgLink);
        }

        // Set up the 'lobbyUpdate' event listener
        const handleLobbyUpdate = (data) => {
            console.log("received update setting users here", data);
            setConnectedUsers(data);
        };

        const handleAvatarUpdate = (username, avatarUrl) => {
            // console.log("received update setting users here", [username, avatarUrl]);
            console.log('avatar', avatarUrl)

            const imageElement = document.getElementById(`avatar-${username}`);
            console.log('imageElement', imageElement)
            if (imageElement) {
                imageElement.src = '/1.png';
            }
        };

        const handleStoryUpdate = (data) => {
            console.log("received update story image here", data);
            console.log('ASDASDASD', story)
            setStory(story + data)
        }


        checkIfLobbyIdValid();
        generateQrCode();
        assignAvatar();
        genImageWithText();

        socket.on("lobbyUpdate", handleLobbyUpdate);
        socket.on("lobbyAvatarUpdate", handleAvatarUpdate);
        socket.on("lobbyStoryUpdate", handleStoryUpdate);

        // Clean up the event listener when the component unmounts
        return () => {
            socket.off("lobbyUpdate", handleLobbyUpdate);
            socket.off("lobbyAvatarUpdate", handleAvatarUpdate);
            socket.off("lobbyStoryUpdate", handleStoryUpdate);
        };
    }, []);

    return (
        <div className="grow min-h-screen flex-col bg-stone-800 ">
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
                <div className="navbar-end">
                    <button className="btn btn-ghost bg-indigo-200 text-black hover:bg-indigo-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5" viewBox="0 0 20 20" fill="black">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.53 15.848L15.53 10.848C16.1567 10.4563 16.1567 9.54368 15.53 9.15201L7.53 4.15201C6.86395 3.73573 6 4.21458 6 5.00001L6 15C6 15.7854 6.86395 16.2643 7.53 15.848ZM8 13.1958L8 6.80426L13.1132 10L8 13.1958Z" fill="#000000" />
                        </svg>
                        <p className=""> Play </p>
                    </button>
                </div>
            </div>

            {/* Actual stuff now */}

            {lobbyExists
                ? <div className="flex flex-col items-center pt-20">


                    {!joinedLobby && (
                        <div className="row mt-3 mb-80">
                            <input placeholder='username' className='px-5 py-2 border-none bg-white text-black rounded-l-md' onChange={(e) => setUsername(e.target.value)}></input>
                            <button className='bg-gray-300 px-5 py-2 duration-200 rounded-r-md hover:bg-gray-400' onClick={joinLobby}>Join Lobby</button>
                        </div>
                    )}

                    <div>
                        {isLobbyTime ?
                            <div>
                                <div className="flex flex-col items-center mt-3 mb-5">
                                    <div className="row">
                                        <input placeholder='Enter your avatar prompt' value={avatarText} className='px-5 py-2 w-1/3 border-none bg-white text-black rounded-l-md' onChange={(e) => setAvatarText(e.target.value)}></input>
                                        <button className='bg-gray-300 px-5 py-2 duration-200 rounded-r-md hover:bg-gray-400' onClick={assignAvatar}>Generate</button>
                                        <button className="btn btn-secondary" onClick={startStoryMode}>Start Story</button>
                                    </div>
                                </div>
                                <input disabled value={story} />
                                <div className="flex flex-row items-center max-w-[80vw] min-w-[50vw] overflow-x-scroll bg-gray-200">
                                    <div className="text-black flex flex-row items-center ml-auto mr-auto">
                                        {connectedUsers.map((user, index) => (
                                            <div key={index} className="w-80 h-96 m-3 rounded-md flex flex-row items-center bg-gray-50">
                                                <img className='bg-white w-[400px] h-[400px]' id={`avatar-${user}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {qrCode && (
                                    <div>
                                        <img src={qrCode} alt='qr code' height={200} width={200} />
                                    </div>
                                )}
                            </div>
                            :
                            <>
                                {
                                    isStoryTime ?
                                    <>
                                        <div id="main story strip" className="flex flex-row-reverse items-center mt-1/3 w-[80vw] h-[65vh] overflow-x-scroll bg-gray-200">
                                            <input value={story}/> 
                                            <div className="text-black items-center ml-auto mr-auto">
                                                {/* /LONG STORY SHIT HERE */}
                                            </div>
                                            {/* MAP ALL CHATS AND STORIES */}
                                        </div>
                                        <div>
                                            <input placeholder="Type To Add On Story!" value={storyText} onChange={e => setStoryText(e.target.value)} />
                                            <button onClick={genImageWithText}> Go </button>
                                        </div>
                                    </>
                                    :
                                    <>
                                    </>
                                }
                            </>
                        }
                    </div>
                </div>
                : <div>
                    <p>that lobby id does not exist</p>
                </div>
            }
        </div>
    );
}