import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { LuSendHorizonal, LuMic, LuMicOff } from "react-icons/lu";
import { Howl } from 'howler';

const VoiceChat = ({ onSpeakingStateChange }) => {
    const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(false);

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [currentSentence, setCurrentSentence] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [showLoader, setShowLoader] = useState(false);

    const cancelTokenSource = useRef(axios.CancelToken.source());
    const mediaRecorderRef = useRef(null);
    const initialMessageSentRef = useRef(false);
    const sentencesRef = useRef([]);
    const buttonClass = "mx-2 flex justify-center items-center p-4 rounded-full bg-red-900 text-gray-100 focus:outline-none text-xl font-bold";
    const stopButtonClass = `${buttonClass} text-2xl px-6`;

    useEffect(() => {
        setIsSpeechSynthesisSupported('speechSynthesis' in window);
    }, []);
    // Notifier le parent (App.jsx) quand l'état de la parole change
    useEffect(() => {
        if (onSpeakingStateChange) {
            onSpeakingStateChange(isSpeaking);
        }
    }, [isSpeaking, onSpeakingStateChange]);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel(); // Annuler la synthèse vocale en cours lors du démontage
        };
    }, []);

    useEffect(() => {
        if (audioBlob) {
            sendAudioToGroq();
        }
    }, [audioBlob]);

    const sendInitialMessage = useCallback(async () => {
        if (!initialMessageSentRef.current) {
            initialMessageSentRef.current = true;
            await sendMessage(`
                adopte le role de super Connasse `);
        }
    }, []);


    const handleInputChange = (e) => setInput(e.target.value);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioToGroq = useCallback(async () => {
        if (!audioBlob) return;

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', 'whisper-large-v3');

            const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                }
            });

            const text = response.data.text;
            setInput(text);
            await sendMessage(text);
        } catch (error) {
            console.error('Failed to transcribe audio', error);
            setError('Échec de la transcription audio: ' + error.message);
        } finally {
            setIsLoading(false);
            setAudioBlob(null);
        }
    }, [audioBlob]);

    const sendMessage = async (messageText = input) => {
        if (messageText.trim() === '') return;

        if (messages.some(msg => msg.role === 'user' && msg.content === messageText)) {
            console.log('Message already sent, skipping...');
            return;
        }

        setIsLoading(true);
        setShowLoader(true)
        try {
            const newMessage = { role: 'user', content: messageText };
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            setInput('');

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: updatedMessages,
                model: 'llama-3.1-8b-instant',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                },
            });

            const assistantMessage = response.data.choices[0].message.content;
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
            console.log(assistantMessage)
            // Segmenter la réponse en phrases
            sentencesRef.current = assistantMessage.match(/[^\.!\?]+[\.!\?]+/g) || [assistantMessage];

            setTimeout(() => {
                playNextSentence();
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            setError('Erreur lors de l\'envoi du message: ' + error.message);
        } finally {
            setIsLoading(false);
            setShowLoader(false); // Désactiver le loader
        }
    };


    const Loader = () => (
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );

    const playNextSentence = async () => {
        if (sentencesRef.current.length > 0) {
            const sentence = sentencesRef.current.shift().trim();
            setCurrentSentence(sentence);
            try {
                await synthesizeAudio(sentence);
                setTimeout(playNextSentence, 500); // Passer à la phrase suivante après un petit délai
            } catch (err) {
                console.error('Error during audio synthesis:', err);
                setTimeout(playNextSentence, 500); // Passer à la phrase suivante même en cas d'erreur
            }
        }
    };

    // src/synthesizeAudio.js
    // Modifier la fonction synthesizeAudio pour mettre à jour isSpeaking
    // const synthesizeAudio = async (text) => {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             // Attendre que les voix soient chargées
    //             if (window.speechSynthesis.getVoices().length === 0) {
    //                 window.speechSynthesis.addEventListener('voiceschanged', () => {
    //                     setupUtterance();
    //                 }, { once: true });
    //             } else {
    //                 setupUtterance();
    //             }

    //             function setupUtterance() {
    //                 const utterance = new SpeechSynthesisUtterance(text);
    //                 utterance.lang = 'fr-FR';

    //                 // Obtenir toutes les voix disponibles
    //                 const voices = window.speechSynthesis.getVoices();

    //                 // Chercher une voix française dans l'ordre de préférence
    //                 const frenchVoice = voices.find(voice =>
    //                     voice.lang.includes('fr-FR') && voice.name.includes('Google')) ||
    //                     voices.find(voice => voice.lang.includes('fr-FR')) ||
    //                     voices.find(voice => voice.lang.includes('fr'));

    //                 if (frenchVoice) {
    //                     utterance.voice = frenchVoice;
    //                 } else {
    //                     console.warn('Aucune voix française trouvée, utilisation de la voix par défaut');
    //                 }

    //                 utterance.onstart = () => {
    //                     setIsSpeaking(true);
    //                     console.log("Début de la synthèse vocale");
    //                 };

    //                 utterance.onend = () => {
    //                     setIsSpeaking(false);
    //                     console.log("Fin de la synthèse vocale");
    //                     resolve();
    //                 };

    //                 utterance.onerror = (error) => {
    //                     console.error('Erreur détaillée:', error);
    //                     setIsSpeaking(false);
    //                     reject(error);
    //                 };

    //                 // Ajouter un petit délai avant de parler
    //                 setTimeout(() => {
    //                     window.speechSynthesis.speak(utterance);
    //                 }, 100);
    //             }
    //         } catch (error) {
    //             console.error('Erreur lors de la configuration:', error);
    //             setIsSpeaking(false);
    //             reject(error);
    //         }
    //     });
    // };



    // Créez un fichier .env à la racine du projet
    // VITE_GOOGLE_API_KEY=votre_clé_api

    const apiKey = import.meta.env.VITE_TEXT_SPEECH_GOOGLE
    const synthesizeAudio = async (text) => {
        try {
            setIsSpeaking(true);
            console.log(import.meta.env.VITE_TEXT_SPEECH_GOOGLE)
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text },
                    voice: {
                        languageCode: 'fr-FR',
                        name: 'fr-FR-Standard-A',
                        ssmlGender: 'FEMALE'
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        pitch: 0,
                        speakingRate: 1
                    }
                })
            });
    
            if (!response.ok) {
                throw new Error('Erreur lors de la requête à Google TTS');
            }
    
            const { audioContent } = await response.json();
    
            // Vérifiez que audioContent est défini
            if (!audioContent) {
                throw new Error('Aucun contenu audio reçu');
            }
    
            // Créer un blob audio à partir du contenu base64
            const audioBlob = new Blob(
                [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
                { type: 'audio/mp3' }
            );
    
            // Créer une URL pour le blob
            const audioUrl = URL.createObjectURL(audioBlob);
    
            // Jouer l'audio
            const audio = new Audio(audioUrl);
    
            return new Promise((resolve, reject) => {
                audio.onended = () => {
                    setIsSpeaking(false);
                    URL.revokeObjectURL(audioUrl); // Nettoyage de l'URL
                    resolve();
                };
    
                audio.onerror = (error) => {
                    setIsSpeaking(false);
                    URL.revokeObjectURL(audioUrl); // Nettoyage de l'URL
                    reject(error);
                };
    
                audio.play().catch(error => {
                    setIsSpeaking(false);
                    URL.revokeObjectURL(audioUrl); // Nettoyage de l'URL
                    reject(error);
                });
            });
    
        } catch (error) {
            setIsSpeaking(false);
            console.error('Erreur de synthèse audio:', error);
            throw error;
        }
    };
    

    // Configuration pour Vite (.env)







    const handleStopAudio = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false); // S'assurer que l'état est mis à jour
        setCurrentSentence('');
        cancelTokenSource.current.cancel('Operation canceled by the user.');
        cancelTokenSource.current = axios.CancelToken.source();
        sentencesRef.current = [];
    };
    return (
        <div className="flex justify-center">
            <div className="w-full md:w-2/3 md:flex flex-col relative">
                {/* <div className="flex-grow overflow-y-auto py-24 px-4 mb-[200px] ">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className="whitespace-pre-wrap mb-4"
                            style={{ color: message.role === "user" ? "black" : "green" }}
                        >
                            <strong>{`${message.role}: `}</strong>
                            {message.content}
                        </div>
                    ))}
                    {currentSentence && (
                        <div className="whitespace-pre-wrap mb-4" style={{ color: "blue" }}>
                            <strong>Current: </strong>
                            {currentSentence}
                        </div>
                    )}
                </div> */}

                <div className="absolute bottom-20 w-full px-4">
                    <div className="flex justify-center">
                        <input
                            className="w-full p-2 border border-gray-300 rounded shadow-xl"
                            value={input}
                            placeholder="Dites quelque chose"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className='flex justify-center mt-4'>
                        {showLoader ? (
                            <Loader />
                        ) : isSpeaking ? (
                            <button onClick={handleStopAudio} className={stopButtonClass}>
                                Stop
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={buttonClass}
                                >
                                    {isRecording ? <LuMicOff size='3em' /> : <LuMic size='3em' />}
                                </button>
                                <button onClick={() => sendMessage()} className={buttonClass}>
                                    <LuSendHorizonal size='3em' />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-4 w-full flex justify-center space-x-4">
                    <button onClick={handleStopAudio} className="bg-red-500 text-white p-2 rounded">
                        Stop
                    </button>
                </div>
            </div>

            {error && <div className="absolute bottom-0 w-full text-center text-red-500">{error}</div>}
        </div>
    );
};

export default VoiceChat;