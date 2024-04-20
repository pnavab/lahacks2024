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

    const [avatarText, setAvatarText] = useState('Not Set Yet')

    function assignAvatar() {


        // Generate Image here


        console.log(avatarText)
        socket.emit("updateAvatar", username, params.id, avatarText)
    }

    function joinLobby() {
        // todo: check if username is already taken
        socket.emit("joinLobby", username, params.id, avatarText);
        socket.on('lobbyJoined', (data) => {
            console.log("joined lobby")
            setJoinedLobby(true);
        });
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
            const response = await fetch("http://localhost:3000/api/qr", {
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
            setConnectedUsers([data]);
        };

        
        const handleAvatarUpdate = (username, avatar) => {
            // console.log("received update setting users here", [username, avatar]);
            console.log('avatar', avatar)
            const imageElement = document.getElementById(`avatar-${username}`);
            if (imageElement) {
                imageElement.src = '/1.png';
            }
        };



        checkIfLobbyIdValid();
        generateQrCode();
        assignAvatar()

        socket.on("lobbyUpdate", handleLobbyUpdate);
        socket.on("lobbyAvatarUpdate", handleAvatarUpdate);

        // Clean up the event listener when the component unmounts
        return () => {
            socket.off("lobbyUpdate", handleLobbyUpdate);
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
                            <input placeholder='username' onChange={(e) => setUsername(e.target.value)}></input>
                            <button className="btn" onClick={joinLobby}>join lobby</button>
                        </div>
                    )}

                    

                    <div className="flex flex-col items-center max-w-[80vw] min-w-[50vw] overflow-x-scroll bg-gray-200">
                        <div className="text-black flex flex-row items-center ml-auto mr-auto">
                            {console.log(connectedUsers, 'asdasd')}
                            {connectedUsers.filter(user => user != username).map((user, index) => (
                                <div key={index} className="w-80 h-96 m-3 rounded-md flex flex-row items-center bg-gray-50">
                                    {user}
                                    <img className='bg-white' id={`avatar-${user}`} alt={`${user}'s avatar`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <input placeholder="Type For Avatar!" value={avatarText} onChange={e => setAvatarText(e.target.value)}/>
                        <button onClick={assignAvatar}> Go </button>
                    </div>
                    {avatarText}

                    {qrCode && (
                        <div>
                            <img src={qrCode} alt='qr code' height={200} width={200} />
                        </div>
                    )}
                </div>
                : <div>
                    <p>that lobby id does not exist</p>
                </div>
            }
        </div>
    );
}