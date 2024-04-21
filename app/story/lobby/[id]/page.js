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
    const [storyPrompt, setStoryPrompt] = useState('')
    const [storyContext, setStoryContext] = useState([])

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

    async function sendPromptToGenerateImage(prompt) {
        const response = await fetch('/api/generate_fireworks_image', {
            body: JSON.stringify({ 'prompt': prompt}),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        const data = await response.json();
        const picture = 'data:image/png;base64,' + data.image;
        socket.emit("updateStory", username, params.id, picture);
        
        // const getHexCodes = await fetch('/api/get_mood', {
        //     body: JSON.stringify({ 'image': picture}),
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     method: 'POST',
        // });
        // const data2 = await getHexCodes.json();
        // console.log('HEXCODES', data2);
        // const hex1 = data2.hex1.trim();
        // const hex2 = data2.hex2.trim();

        // imageDiv.classList.add(`bg-[${hex1}]-400`);
        // imageDiv.classList.add('bg-gradient-to-tr');
        // imageDiv.classList.add(`from-${hex1}-400`);
        // imageDiv.classList.add(`to-${hex2}-400`);
      }
      
      async function sendPromptToGenerateStory() {

        // Gen Story Image here Et here

        console.log('sendPromptToGenerateStory button clicked', storyPrompt);
        socket.emit("updateStory", username, params.id, storyPrompt);
        let contextToSend = storyContext.filter((element) => !element.startsWith('data'));
        contextToSend = [storyPrompt, ...contextToSend]
        contextToSend = contextToSend.reverse();
        console.log("context before sending", storyContext);
        console.log("context to send", contextToSend);
        const response = await fetch('/api/generate_storypoint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          body: JSON.stringify({context: contextToSend}),
        });
        const data = await response.json();
        socket.emit("updateStory", username, params.id, data.response);
        sendPromptToGenerateImage(data.response);
    }

    function joinLobby() {
        setIsLobbyTime(true)
        // todo: check if username is already taken
        socket.emit("joinLobby", username, params.id, null);
        socket.on('lobbyJoined', (data) => {
          console.log("joined lobby")
          setJoinedLobby(true);
          setIsStoryTime(true);
          setIsLobbyTime(false);
        });
        startStoryMode();
    }

    function startStoryMode() {
      socket.emit("startStoryMode", params.id);
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
        
        const updateStory = (data) => {
            // console.log("received update story image here", data);
            // console.log('ASDASDASD', story)
            setStory(story + data)
        }
        
        const handleStartStoryModeForAll = (data) => {
            console.log("received start story image here", data);
            setIsLobbyTime(false);
            setIsStoryTime(true);
            setStoryContext(data.reverse());
        }

        const handleUpdateStoryForAll = (lastText, context) => {
            // console.log("received update story image here", lastText, context);
            // setStoryContext(storyContext => [data, ...storyContext]);
            setStoryContext(context.reverse());
            console.log("story context is now", storyContext);
        }

        checkIfLobbyIdValid();
        generateQrCode();
        assignAvatar();

        socket.on("lobbyUpdate", handleLobbyUpdate);
        socket.on("lobbyAvatarUpdate", handleAvatarUpdate);
        socket.on("updateStory", updateStory);
        socket.on("startStoryModeForAll", handleStartStoryModeForAll);
        socket.on("updateStoryForAll", handleUpdateStoryForAll);
        
        // Clean up the event listener when the component unmounts
        return () => {
            socket.off("lobbyUpdate", handleLobbyUpdate);
            socket.off("lobbyAvatarUpdate", handleAvatarUpdate);
            socket.off("updateStory", updateStory);
            socket.off("startStoryModeForAll", handleStartStoryModeForAll);
            socket.off("updateStoryForAll", handleUpdateStoryForAll);
        };
    }, []);

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

    return (
        <div className="grow min-h-screen flex-col bg-stone-800 ">
            <div className="navbar fixed top-2 left-0 right-0 shadow-lg border-none bg-transparent text-white z-10">
                <div className="navbar-start">
                    <div className="navbar-center">
                        <Link href='/' className="btn btn-ghost normal-case text-xl hover:bg-transparent hover:text-gray-300 duration-300" >
                            Bards
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
                    </div>+
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
                ? <div className="flex flex-col items-center ">

                    {!joinedLobby && (
                        <div className="row mt-80">
                            <input placeholder='username' className='px-5 py-2 flex-grow rounded-l-md bg-stone-600' onChange={(e) => setUsername(e.target.value)}></input>
                            <button className='px-4 py-2 rounded-r-md bg-blue-200 hover:bg-blue-300 text-black' onClick={joinLobby}>Join Lobby</button>
                        </div>
                    )}

                    <div className="w-full">
                        {isLobbyTime ? <></> :
                            <>
                                {
                                    isStoryTime ?
                                    <div className="mt-32 w-full flex flex-row">
                                        <div className="ml-8">
                                            <div className="flex flex-row w-full">
                                                <input className="flex-grow rounded-lg px-5 bg-stone-600" placeholder="Type To Add On Story!" value={storyPrompt} onChange={e => setStoryPrompt(e.target.value)} />
                                                <button className="px-6 py-4 rounded-md bg-blue-200 hover:bg-blue-300 text-black ml-4" onClick={sendPromptToGenerateStory}> Go </button>
                                            </div>
                                            <div id="main story strip" className="flex flex-row items-center mt-4 w-[75vw] h-[65vh] bg-stone-700 rounded-lg overflow-y-scroll">
                                                <div className="no-scrollbar text-white flex flex-row overflow-y-scroll items-center ml-auto mr-auto">
                                                    {storyContext.map((storyPoint, index) => (
                                                      <div key={index} id={`image-${index}`} className={`px-4 py-8 m-3 rounded-md flex items-center justify-center ${index === 0 ? 'bg-blue-400' : 'bg-stone-600'}`}>
                                                        <div className="flex flex-col items-center justify-center w-full h-full">
                                                            {typeof storyPoint === 'string' && !storyPoint.startsWith('data') ? (
                                                                <div className="w-[300px] h-[80%] text-white flex items-center justify-center px-4">
                                                                    {storyPoint}
                                                                </div>
                                                            ) : (
                                                                <div className="w-[300px] h-[80%] flex items-center justify-center">
                                                                    <img className='max-w-full max-h-full bg-white' src={storyPoint} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>                                                                                            
                                                  ))}
                                              </div>
                                            {/* MAP ALL CHATS AND STORIES */}
                                        </div>
                                    </div>
                                        <div className="ml-4 w-30">
                                            <button className='px-6 py-4 rounded-md bg-blue-200 hover:bg-blue-300 text-black mb-4' onClick={copyUrlToClipboard}>Copy Invite Link</button>
                                            <div className=" border-stone-900 border-2 bg-stone-700 rounded-md">
                                                {connectedUsers.length > 0 ?
                                                    <h1 className='text-center w-full px-4 py-2'>Bards:</h1>
                                                    :
                                                    <h1 className='text-center w-full px-4 py-2'>No One Joined Yet!</h1>
                                                }
                                                <div className="grid grid-cols-1 w-full">
                                                    {connectedUsers.map((user, index) => (
                                                        <div key={index} className={`text-white ${index === connectedUsers.length - 1 ? 'rounded-b-md' : ''} w-full`}>
                                                            <h1 className='px-3 py-2'>{user}</h1>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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