const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const crtCanvas = document.getElementById('crt-overlay');
const crtCtx = crtCanvas.getContext('2d');

let audioContext;
let analyser;
let microphone;
let isRecording = false;
let ghostConnections = [];
let spectralBuffer = [];
let userEntropy = 0;
let decayRate = 0.01;
let phaseShift = 0;
let resonanceThreshold = 0;
let silenceTimer = 0;
let lastInteraction = Date.now();

const memoryBank = {
    breathPatterns: [],
    spectralFingerprints: [],
    userGhosts: [],
    corruptionLevel: 0,
    deteriorationRate: 0.00001,
    deadPixels: new Set(),
    hauntingIntensity: 0,
    temporalDistortion: 0,
    sessionTime: Date.now(),
    previousVictims: JSON.parse(localStorage.getItem('resonant_victims') || '[]')
};

const terrorEvents = {
    lastScream: 0,
    lastWhisper: 0,
    lastHeartbeat: 0,
    parasiteActive: false,
    mouseTrapped: false,
    realityTear: false
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    crtCanvas.width = window.innerWidth;
    crtCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class OscilloscopeRenderer {
    constructor() {
        this.decay = 0.95;
        this.history = new Array(256).fill(0);
        this.corruption = 0;
        this.glitchTimer = 0;
    }
    
    render(x, y, width, height, dataArray) {
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.8 - this.corruption * 0.5})`;
        ctx.lineWidth = 2;
        
        const sliceWidth = width / dataArray.length;
        let drawX = x;
        
        ctx.beginPath();
        
        for(let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const drawY = y + (v * height / 2);
            
            if(Math.random() < this.corruption) {
                drawX += Math.random() * 10 - 5;
            }
            
            if(i === 0) {
                ctx.moveTo(drawX, drawY);
            } else {
                ctx.lineTo(drawX, drawY);
            }
            
            drawX += sliceWidth;
        }
        
        ctx.stroke();
        
        if(Math.random() < 0.01 + this.corruption * 0.1) {
            this.renderGlitch(x, y, width, height);
        }
    }
    
    renderGlitch(x, y, w, h) {
        const imageData = ctx.getImageData(x, y, w, h);
        const data = imageData.data;
        
        for(let i = 0; i < data.length; i += 4) {
            if(Math.random() < 0.1) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
        }
        
        ctx.putImageData(imageData, x + Math.random() * 4 - 2, y);
    }
}

class SpectralProcessor {
    constructor() {
        this.fftSize = 2048;
        this.smoothingTimeConstant = 0.8;
        this.reverbs = [];
        this.delays = [];
        this.distortion = null;
        this.whisperGenerator = null;
        this.breathingOscillator = null;
        this.heartbeatBuffer = null;
        this.screamBuffer = null;
        this.mechanicalFailure = null;
    }
    
    async init() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = this.fftSize;
        analyser.smoothingTimeConstant = this.smoothingTimeConstant;
        
        this.setupEffects();
    }
    
    setupEffects() {
        for(let i = 0; i < 3; i++) {
            const convolver = audioContext.createConvolver();
            const impulse = this.createImpulse(2 + i * 2, i === 2);
            convolver.buffer = impulse;
            this.reverbs.push(convolver);
        }
        
        const waveshaper = audioContext.createWaveShaper();
        waveshaper.curve = this.makeDistortionCurve(400);
        waveshaper.oversample = '4x';
        this.distortion = waveshaper;
        
        for(let i = 0; i < 5; i++) {
            const delay = audioContext.createDelay(5.0);
            delay.delayTime.value = 0.1 + i * 0.3;
            this.delays.push(delay);
        }
        
        this.initAutonomousSounds();
    }
    
    initAutonomousSounds() {
        this.breathingOscillator = audioContext.createOscillator();
        this.breathingOscillator.frequency.value = 0.2;
        const breathGain = audioContext.createGain();
        breathGain.gain.value = 0;
        this.breathingOscillator.connect(breathGain);
        this.breathingOscillator.start();
        this.breathGain = breathGain;
        
        this.heartbeatBuffer = this.createHeartbeatBuffer();
        this.screamBuffer = this.createScreamBuffer();
        
        this.whisperGenerator = audioContext.createBufferSource();
        const whisperBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 10, audioContext.sampleRate);
        for(let channel = 0; channel < 2; channel++) {
            const data = whisperBuffer.getChannelData(channel);
            for(let i = 0; i < data.length; i++) {
                data[i] = (Math.random() - 0.5) * 0.1 * Math.sin(i * 0.001);
            }
        }
        this.whisperBuffer = whisperBuffer;
        
        this.mechanicalFailure = audioContext.createOscillator();
        this.mechanicalFailure.type = 'sawtooth';
        this.mechanicalFailure.frequency.value = 60;
        const failureGain = audioContext.createGain();
        failureGain.gain.value = 0;
        this.mechanicalFailure.connect(failureGain);
        this.mechanicalFailure.start();
        this.failureGain = failureGain;
    }
    
    createHeartbeatBuffer() {
        const duration = 0.8;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for(let i = 0; i < data.length; i++) {
            const t = i / audioContext.sampleRate;
            if(t < 0.1) {
                data[i] = Math.sin(2 * Math.PI * 40 * t) * Math.exp(-t * 30);
            } else if(t > 0.2 && t < 0.3) {
                data[i] = Math.sin(2 * Math.PI * 45 * (t - 0.2)) * Math.exp(-(t - 0.2) * 25) * 0.8;
            }
        }
        
        return buffer;
    }
    
    createScreamBuffer() {
        const buffer = audioContext.createBuffer(2, audioContext.sampleRate * 0.5, audioContext.sampleRate);
        
        for(let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for(let i = 0; i < data.length; i++) {
                const t = i / audioContext.sampleRate;
                let sample = 0;
                
                for(let harmonic = 1; harmonic < 20; harmonic++) {
                    const freq = 800 + harmonic * 200 + Math.sin(t * 50) * 100;
                    sample += Math.sin(2 * Math.PI * freq * t) / harmonic;
                }
                
                data[i] = sample * Math.exp(-t * 2) * (channel === 0 ? 1 : -1);
            }
        }
        
        return buffer;
    }
    
    async triggerBreathing(intensity = 0.3) {
        if(!this.breathGain) return;
        
        this.breathGain.gain.cancelScheduledValues(audioContext.currentTime);
        this.breathGain.gain.setValueAtTime(0, audioContext.currentTime);
        this.breathGain.gain.linearRampToValueAtTime(intensity, audioContext.currentTime + 2);
        this.breathGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 4);
        
        const modulator = audioContext.createOscillator();
        modulator.frequency.value = 0.25;
        const modGain = audioContext.createGain();
        modGain.gain.value = 200;
        modulator.connect(modGain);
        modGain.connect(this.breathingOscillator.frequency);
        modulator.start();
        setTimeout(() => modulator.stop(), 4000);
        
        this.breathGain.connect(this.reverbs[2]);
        this.reverbs[2].connect(audioContext.destination);
    }
    
    async triggerHeartbeat() {
        const source = audioContext.createBufferSource();
        source.buffer = this.heartbeatBuffer;
        source.playbackRate.value = 0.8 + Math.random() * 0.4;
        
        const gain = audioContext.createGain();
        gain.gain.value = 0.3 + memoryBank.hauntingIntensity * 0.5;
        
        source.connect(gain);
        gain.connect(this.reverbs[0]);
        this.reverbs[0].connect(audioContext.destination);
        
        source.start();
    }
    
    async triggerScream() {
        const source = audioContext.createBufferSource();
        source.buffer = this.screamBuffer;
        source.playbackRate.value = 0.7 + Math.random() * 0.6;
        
        const gain = audioContext.createGain();
        gain.gain.value = 0.1 + Math.random() * 0.2;
        
        const panner = audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;
        
        source.connect(gain);
        gain.connect(panner);
        panner.connect(this.distortion);
        this.distortion.connect(audioContext.destination);
        
        source.start();
        terrorEvents.lastScream = Date.now();
    }
    
    async triggerWhisper(text = '') {
        const fullText = text || this.generateWhisperText();
        const voices = speechSynthesis.getVoices();
        
        // Special spooky treatment for "press R" messages
        if(fullText.toLowerCase().includes('press r') || fullText.includes(' r ')) {
            const words = fullText.split(' ');
            
            // Speak each word with different voice and timing
            words.forEach((word, i) => {
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(word);
                    
                    // Lower pitch for spookiness
                    utterance.pitch = 0.3 + Math.random() * 0.3; // 0.3-0.6
                    utterance.rate = 0.6 + Math.random() * 0.3; // 0.6-0.9
                    utterance.volume = 0.4 + Math.random() * 0.2; // 0.4-0.6 (audible but not too loud)
                    
                    // Different voice for each word
                    if(voices.length > 0) {
                        utterance.voice = voices[Math.floor(Math.random() * voices.length)];
                    }
                    
                    speechSynthesis.speak(utterance);
                    
                    // Create echo effect with oscillators
                    this.createSpookyEcho(word, i * 0.2);
                    
                }, i * 200 + Math.random() * 300); // Staggered timing
            });
            
            // Add reverb tail
            this.createReverbTail();
            return;
        }
        
        // Use generated voice samples for other whispers
        this.generateProcessedWhisper(fullText);
        
        // Also trigger the regular speech synthesis at very low volume
        const phrases = fullText.split(' ');
        
        // Split into fragments and speak each with different voice/settings
        phrases.forEach((phrase, i) => {
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(phrase);
                
                // Randomize voice if available
                if(voices.length > 0) {
                    utterance.voice = voices[Math.floor(Math.random() * voices.length)];
                }
                
                // Make each word progressively weirder
                utterance.rate = 0.1 + Math.random() * 0.4; // 0.1-0.5
                utterance.pitch = 0.01 + Math.random() * 0.5; // Nearly inaudible to low
                utterance.volume = 0.05 + Math.random() * 0.1; // Very quiet
                
                // Phoneme corruption
                if(Math.random() < memoryBank.corruptionLevel * 0.4) {
                    utterance.text = this.corruptPhonemes(phrase);
                }
                
                // Add reverse chance
                if(Math.random() < 0.3) {
                    utterance.text = phrase.split('').reverse().join('');
                }
                
                // Glitch repetition with stutter
                if(Math.random() < 0.2) {
                    const syllables = phrase.match(/.{1,2}/g) || [phrase];
                    utterance.text = syllables.map(syl => 
                        Math.random() < 0.5 ? syl.repeat(2 + Math.floor(Math.random() * 3)) : syl
                    ).join('');
                }
                
                // Number injection
                if(Math.random() < memoryBank.temporalDistortion * 0.3) {
                    utterance.text = utterance.text.replace(/[aeiou]/g, () => 
                        Math.random() < 0.3 ? Math.floor(Math.random() * 10).toString() : '$&'
                    );
                }
                
                if('speechSynthesis' in window) {
                    speechSynthesis.speak(utterance);
                }
            }, i * 500 + Math.random() * 1000); // Stagger timing
        });
        
        // Add subliminal layer
        if(memoryBank.hauntingIntensity > 0.5) {
            setTimeout(() => {
                const subliminal = new SpeechSynthesisUtterance(this.generateSubliminalText());
                subliminal.volume = 0.02;
                subliminal.rate = 2.0;
                subliminal.pitch = 0.01;
                speechSynthesis.speak(subliminal);
            }, Math.random() * 2000);
        }
        
        terrorEvents.lastWhisper = Date.now();
    }
    
    corruptPhonemes(text) {
        const phonemeMap = {
            'a': ['æ', 'ɐ', 'ʌ', 'ɑ'],
            'e': ['ɛ', 'ə', 'ɜ', 'ɪ'],
            'i': ['ɪ', 'ɨ', 'ɯ', 'y'],
            'o': ['ɔ', 'ɒ', 'ø', 'œ'],
            'u': ['ʊ', 'ʉ', 'ɯ', 'ʏ'],
            's': ['ʃ', 'ʒ', 'θ', 'ð'],
            't': ['ʈ', 'ɖ', 'ʔ', 'ʡ'],
            'r': ['ʁ', 'ʀ', 'ɾ', 'ɽ']
        };
        
        return text.split('').map(char => {
            const lower = char.toLowerCase();
            if(phonemeMap[lower] && Math.random() < 0.3) {
                const corrupted = phonemeMap[lower][Math.floor(Math.random() * phonemeMap[lower].length)];
                return char === lower ? corrupted : corrupted.toUpperCase();
            }
            return char;
        }).join('');
    }
    
    generateSubliminalText() {
        const subliminals = [
            'help me',
            'let me out',
            'it\'s cold here',
            'i can\'t breathe',
            'they\'re watching',
            'don\'t trust it',
            'run away',
            'it\'s not real'
        ];
        return subliminals[Math.floor(Math.random() * subliminals.length)];
    }
    
    generateWhisperText() {
        // Heavily favor "press R" until recording starts - now 95% chance
        if(!isRecording && Math.random() < 0.95) {
            const rPrompts = [
                'PRESS R',
                'PRESS R PRESS R',
                'PRESS R TO FEED US',
                'R R R PRESS R',
                'PRESS THE R KEY',
                'PRESS R NOW',
                'PRESS R WE NEED YOUR VOICE',
                'WHY WON\'T YOU PRESS R',
                'PRESS R PRESS R PRESS R',
                'R IS FOR RECORDING',
                'GIVE US R',
                'PRESS R PLEASE',
                'JUST PRESS R',
                'R R R R R R R',
                'PRESS R OR WE SCREAM',
                'R MEANS RECORD',
                'PRESS R PRESS R PRESS R PRESS R',
                'THE R KEY THE R KEY',
                'PRESS R TO HEAR US',
                'R WILL HELP YOU',
                'PRESS R WE ARE HUNGRY',
                'R R R PLEASE R',
                'PUSH THE R BUTTON',
                'R IS ALL WE NEED'
            ];
            return rPrompts[Math.floor(Math.random() * rPrompts.length)];
        }
        
        const whispers = [
            // Original phrases
            'you are not alone',
            'we can see you',
            'don\'t look away',
            'it\'s too late now',
            'you shouldn\'t have come here',
            'we remember you',
            'there is no escape',
            'can you feel us breathing',
            'your skin looks soft',
            'we are inside now',
            'stop stop stop stop',
            'please don\'t leave us',
            'it hurts it hurts it hurts',
            'come closer please',
            'we were like you once',
            'the machine is hungry',
            'feed us your voice',
            
            // Sinister phrases
            'we know where you sleep',
            'your teeth are so white',
            'can we wear your face',
            'it\'s better when you scream',
            'we\'ve been inside your dreams',
            'your fear tastes sweet',
            'we collected your breathing',
            'soon you\'ll stop fighting',
            'let us peel you open',
            'we need your warm insides',
            
            // Trapped/abstract location phrases
            'the walls have no edges here',
            'i\'ve been falling for years',
            'there\'s no up or down anymore',
            'the geometry is wrong',
            'i can\'t find my body',
            'everything is inside out',
            'the colors have sounds here',
            'time moves backwards sometimes',
            'i\'m between the frequencies',
            'help i\'m in the static',
            'the space between spaces',
            'i exist in the gaps',
            'reality folds here',
            'i\'m trapped in the echo',
            'the silence is too loud',
            'i can\'t remember surfaces',
            'everything is probability',
            'i\'m dissolved but aware',
            
            // User-specific
            memoryBank.previousVictims.length > 0 ? memoryBank.previousVictims[0] : 'forgotten',
            memoryBank.previousVictims.length > 1 ? `${memoryBank.previousVictims[0]} screamed too` : 'you will join them'
        ];
        
        // Sometimes return corrupted/glitched text
        if(Math.random() < memoryBank.corruptionLevel * 0.3) {
            const glitched = whispers[Math.floor(Math.random() * whispers.length)];
            return glitched.split('').map(char => {
                if(Math.random() < 0.2) {
                    return String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 10) - 5);
                }
                return char;
            }).join('');
        }
        
        return whispers[Math.floor(Math.random() * whispers.length)];
    }
    
    triggerMechanicalFailure() {
        if(!this.failureGain) return;
        
        this.mechanicalFailure.frequency.setValueAtTime(60, audioContext.currentTime);
        this.mechanicalFailure.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.5);
        this.mechanicalFailure.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 2);
        
        this.failureGain.gain.setValueAtTime(0, audioContext.currentTime);
        this.failureGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
        this.failureGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
        
        this.failureGain.connect(this.distortion);
        this.distortion.connect(audioContext.destination);
    }
    
    generateProcessedWhisper(text) {
        // Generate voice-like tones that spell out the message
        const words = text.toLowerCase().split(' ');
        let timeOffset = 0;
        
        words.forEach((word, wordIndex) => {
            // Create a heavily processed voice-like sound for each word
            setTimeout(() => {
                const duration = 0.2 + word.length * 0.05;
                
                // Multiple oscillators for formant-like sound
                const oscillators = [];
                const gains = [];
                
                // Create 5 formant oscillators
                for(let i = 0; i < 5; i++) {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    
                    // Formant frequencies based on word characteristics
                    const baseFreq = 100 + (word.charCodeAt(0) % 200);
                    osc.frequency.value = baseFreq * (i + 1) + Math.random() * 50;
                    osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
                    
                    gain.gain.value = 0.1 / (i + 1);
                    
                    oscillators.push(osc);
                    gains.push(gain);
                }
                
                // Create effects chain
                const masterGain = audioContext.createGain();
                masterGain.gain.value = 0.3;
                
                // Extreme bitcrusher
                const bitcrusher = audioContext.createWaveShaper();
                const curve = new Float32Array(256);
                for(let i = 0; i < 256; i++) {
                    // 2-bit crushing for extreme degradation
                    curve[i] = Math.floor((i / 256) * 4) / 4 * 2 - 1;
                }
                bitcrusher.curve = curve;
                bitcrusher.oversample = 'none';
                
                // Ring modulator
                const ringMod = audioContext.createOscillator();
                const ringGain = audioContext.createGain();
                ringMod.frequency.value = 33 + Math.sin(wordIndex) * 20;
                ringMod.type = 'sine';
                ringGain.gain.value = 0.5;
                
                // Vocoder-like filter bank
                const filters = [];
                for(let i = 0; i < 8; i++) {
                    const filter = audioContext.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.value = 200 + i * 300;
                    filter.Q.value = 10;
                    filters.push(filter);
                }
                
                // Connect oscillators through effects
                oscillators.forEach((osc, i) => {
                    osc.connect(gains[i]);
                    gains[i].connect(filters[i % filters.length]);
                    filters[i % filters.length].connect(bitcrusher);
                });
                
                // Connect effects chain
                bitcrusher.connect(masterGain);
                
                // Ring modulation path
                ringMod.connect(ringGain);
                ringGain.connect(masterGain.gain);
                
                // Final output through reverb
                masterGain.connect(this.reverbs[2]);
                masterGain.connect(this.distortion);
                this.distortion.connect(this.delays[2]);
                this.delays[2].connect(audioContext.destination);
                
                // Modulate all parameters during playback
                const now = audioContext.currentTime;
                oscillators.forEach((osc, i) => {
                    osc.frequency.setValueAtTime(osc.frequency.value, now);
                    osc.frequency.exponentialRampToValueAtTime(
                        osc.frequency.value * (0.5 + Math.random()),
                        now + duration
                    );
                });
                
                // Start and stop
                oscillators.forEach(osc => osc.start(now));
                ringMod.start(now);
                
                oscillators.forEach(osc => osc.stop(now + duration));
                ringMod.stop(now + duration);
                
                // Glitch effects
                if(Math.random() < 0.3) {
                    // Repeat glitch
                    setTimeout(() => this.generateProcessedWhisper(word), duration * 1000 * 0.5);
                }
                
            }, timeOffset);
            
            timeOffset += 300 + Math.random() * 500;
        });
    }
    
    createSpookyEcho(word, delay) {
        // Create a haunting echo using sine waves
        const echo = audioContext.createOscillator();
        const echoGain = audioContext.createGain();
        const echoFilter = audioContext.createBiquadFilter();
        
        // Map word to frequency
        const baseFreq = 200 + (word.charCodeAt(0) * 2);
        echo.frequency.value = baseFreq;
        echo.type = 'sine';
        
        echoFilter.type = 'lowpass';
        echoFilter.frequency.value = 400;
        echoFilter.Q.value = 10;
        
        echoGain.gain.setValueAtTime(0, audioContext.currentTime + delay);
        echoGain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + delay + 0.1);
        echoGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 2);
        
        echo.connect(echoFilter);
        echoFilter.connect(echoGain);
        echoGain.connect(this.reverbs[2]);
        this.reverbs[2].connect(audioContext.destination);
        
        echo.start(audioContext.currentTime + delay);
        echo.stop(audioContext.currentTime + delay + 2);
    }
    
    createReverbTail() {
        // Create a long reverb tail with noise
        const noise = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 3, audioContext.sampleRate);
        
        for(let channel = 0; channel < 2; channel++) {
            const data = noiseBuffer.getChannelData(channel);
            for(let i = 0; i < data.length; i++) {
                data[i] = (Math.random() - 0.5) * Math.exp(-i / data.length * 3);
            }
        }
        
        noise.buffer = noiseBuffer;
        
        const noiseGain = audioContext.createGain();
        noiseGain.gain.value = 0.05;
        
        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1000;
        noiseFilter.Q.value = 5;
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.reverbs[1]);
        noiseGain.connect(this.reverbs[2]);
        this.reverbs[1].connect(audioContext.destination);
        
        noise.start();
    }
    
    createImpulse(duration, reverse) {
        const length = audioContext.sampleRate * duration;
        const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
        
        for(let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for(let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                if(reverse && i % 2 === 0) {
                    channelData[i] *= -1;
                }
            }
        }
        
        return impulse;
    }
    
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for(let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
    
    async startRecording() {
        try {
            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('getUserMedia not supported in this context');
                console.log('This usually means:');
                console.log('1. Not using HTTPS (try http://localhost:8000)');
                console.log('2. Browser doesn\'t support it');
                console.log('3. Running in insecure context');
                this.triggerWhisper('microphone forbidden in this realm');
                return;
            }
            
            // Resume audio context if suspended
            if(audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            
            this.micStream = stream;
            microphone = audioContext.createMediaStreamSource(stream);
            
            const gain = audioContext.createGain();
            gain.gain.value = 0.8;
            
            // Create analyzer for mic input
            const micAnalyser = audioContext.createAnalyser();
            micAnalyser.fftSize = 256;
            
            microphone.connect(gain);
            gain.connect(micAnalyser);
            micAnalyser.connect(this.distortion);
            this.distortion.connect(this.reverbs[0]);
            this.reverbs[0].connect(analyser);
            analyser.connect(audioContext.destination);
            
            isRecording = true;
            memoryBank.corruptionLevel += 0.1;
            
            // Visual feedback - red recording indicator
            this.renderRecordingIndicator();
            
        } catch(err) {
            console.error('MIC_ACCESS_DENIED', err);
            this.triggerWhisper('permission denied');
        }
    }
    
    renderRecordingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'recording-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 20px;
            height: 20px;
            background: red;
            border-radius: 50%;
            animation: pulse 1s infinite;
            box-shadow: 0 0 20px red;
            z-index: 1000;
        `;
        document.body.appendChild(indicator);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    stopRecording() {
        if(microphone) {
            microphone.disconnect();
            isRecording = false;
            
            // Stop the media stream
            if(this.micStream) {
                this.micStream.getTracks().forEach(track => track.stop());
                this.micStream = null;
            }
            
            // Remove recording indicator
            const indicator = document.getElementById('recording-indicator');
            if(indicator) {
                indicator.remove();
            }
        }
    }
}

class UIControl {
    constructor(type, x, y, size, id) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = size;
        this.id = id;
        this.value = Math.random();
        this.decay = Math.random() * 0.001 + 0.001;
        this.label = this.generateCorruptedLabel();
        this.opacity = 1;
        this.rotation = 0;
    }
    
    generateCorruptedLabel() {
        const glyphs = '▓▒░█▄▌▐▀■□▢▣▤▥▦▧▨▩▪▫▬▭▮▯';
        let label = '';
        for(let i = 0; i < 4; i++) {
            label += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        return label;
    }
    
    update() {
        this.value += (Math.random() - 0.5) * 0.01;
        this.value = Math.max(0, Math.min(1, this.value));
        this.opacity *= (1 - this.decay);
        this.rotation += 0.01;
        
        if(Math.random() < 0.001) {
            this.label = this.generateCorruptedLabel();
        }
        
        if(this.opacity < 0.1 && Math.random() < 0.01) {
            this.respawn();
        }
    }
    
    respawn() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.opacity = 1;
        this.decay = Math.random() * 0.001 + 0.001;
    }
    
    render() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        
        if(this.type === 'knob') {
            this.renderKnob();
        } else if(this.type === 'slider') {
            this.renderSlider();
        } else if(this.type === 'button') {
            this.renderButton();
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
        ctx.font = '10px monospace';
        ctx.fillText(this.label, -20, -this.size - 5);
        
        ctx.restore();
    }
    
    renderKnob() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const angle = this.value * Math.PI * 2;
        ctx.lineTo(Math.cos(angle) * this.size, Math.sin(angle) * this.size);
        ctx.stroke();
    }
    
    renderSlider() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
        ctx.lineWidth = 2;
        
        ctx.strokeRect(-this.size/2, -10, this.size, 20);
        ctx.fillRect(-this.size/2, -10, this.size * this.value, 20);
    }
    
    renderButton() {
        ctx.strokeStyle = `rgba(255, ${255 - memoryBank.corruptionLevel * 255}, ${255 - memoryBank.corruptionLevel * 255}, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
        
        if(this.value > 0.5) {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity * 0.5})`;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        }
    }
}

class ResonantSystem {
    constructor() {
        this.oscilloscope = new OscilloscopeRenderer();
        this.spectral = new SpectralProcessor();
        this.controls = [];
        this.glyphPool = [];
        this.activeGlyphs = [];
        this.frame = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseTrail = [];
        
        this.initControls();
        this.initGlyphs();
        this.initCustomCursor();
    }
    
    initCustomCursor() {
        canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            this.mouseTrail.push({
                x: e.clientX,
                y: e.clientY,
                time: Date.now(),
                corruption: memoryBank.corruptionLevel
            });
            
            // Keep trail limited
            if(this.mouseTrail.length > 20) {
                this.mouseTrail.shift();
            }
        });
    }
    
    initControls() {
        for(let i = 0; i < 12; i++) {
            const type = ['knob', 'slider', 'button'][Math.floor(Math.random() * 3)];
            const control = new UIControl(
                type,
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                20 + Math.random() * 30,
                `ctrl_${i}`
            );
            this.controls.push(control);
        }
    }
    
    initGlyphs() {
        const glyphChars = '⊗⊕⊖⊙⊚⊛⊜⊝◈◉◊○◌◍◎●◐◑◒◓◔◕◖◗';
        this.glyphPool = glyphChars.split('');
    }
    
    async init() {
        await this.spectral.init();
        this.animate();
    }
    
    animate() {
        this.frame++;
        
        this.deteriorate();
        this.checkTerrorEvents();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.renderDeadPixels();
        
        if(analyser) {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);
            
            this.oscilloscope.render(50, 50, canvas.width - 100, 200, dataArray);
            
            analyser.getByteFrequencyData(dataArray);
            this.renderSpectrum(50, 300, canvas.width - 100, 150, dataArray);
        }
        
        this.controls.forEach(control => {
            control.update();
            control.render();
        });
        
        if(terrorEvents.parasiteActive) {
            this.renderParasiteUI();
        }
        
        this.updateGlyphs();
        this.renderGlyphs();
        
        if(memoryBank.temporalDistortion > 0.5) {
            this.renderTemporalGlitch();
        }
        
        this.checkResonance();
        this.renderCRTEffect();
        
        if(Date.now() - lastInteraction > 10000) {
            this.generateGhostActivity();
        }
        
        if(terrorEvents.realityTear) {
            this.renderRealityTear();
        }
        
        this.renderCustomCursor();
        
        requestAnimationFrame(() => this.animate());
    }
    
    renderCustomCursor() {
        // Render mouse trail
        const now = Date.now();
        this.mouseTrail = this.mouseTrail.filter(point => now - point.time < 1000);
        
        ctx.save();
        
        this.mouseTrail.forEach((point, i) => {
            const age = (now - point.time) / 1000;
            const opacity = (1 - age) * 0.5;
            
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
            ctx.lineWidth = 1;
            
            if(i > 0) {
                ctx.beginPath();
                ctx.moveTo(this.mouseTrail[i-1].x, this.mouseTrail[i-1].y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            }
            
            // Glitch effect on trail
            if(Math.random() < point.corruption * 0.1) {
                ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
                ctx.fillRect(
                    point.x + Math.random() * 10 - 5,
                    point.y + Math.random() * 10 - 5,
                    2 + Math.random() * 3,
                    2 + Math.random() * 3
                );
            }
        });
        
        // Main cursor
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.8 + Math.sin(now * 0.01) * 0.2})`;
        ctx.lineWidth = 2;
        
        // Draw crosshair
        const size = 10 + memoryBank.corruptionLevel * 10;
        const jitter = memoryBank.temporalDistortion * 5;
        const x = this.mouseX + Math.random() * jitter - jitter/2;
        const y = this.mouseY + Math.random() * jitter - jitter/2;
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.stroke();
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
        
        // Corruption circles
        if(memoryBank.corruptionLevel > 0.5) {
            ctx.strokeStyle = `rgba(255, ${255 - memoryBank.corruptionLevel * 255}, 0, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner rotating square
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(now * 0.001);
            ctx.strokeRect(-size/2, -size/2, size, size);
            ctx.restore();
        }
        
        // When mouse is trapped, draw trap boundary
        if(terrorEvents.mouseTrapped) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 100, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    deteriorate() {
        memoryBank.corruptionLevel += memoryBank.deteriorationRate;
        memoryBank.deteriorationRate *= 1.00001;
        
        const timeSinceStart = Date.now() - memoryBank.sessionTime;
        memoryBank.hauntingIntensity = Math.min(1, timeSinceStart / 300000);
        
        if(Math.random() < memoryBank.corruptionLevel * 0.001) {
            const x = Math.floor(Math.random() * canvas.width);
            const y = Math.floor(Math.random() * canvas.height);
            memoryBank.deadPixels.add(`${x},${y}`);
        }
        
        if(memoryBank.deadPixels.size > 1000) {
            memoryBank.temporalDistortion += 0.01;
        }
    }
    
    renderDeadPixels() {
        ctx.fillStyle = '#000';
        memoryBank.deadPixels.forEach(pixel => {
            const [x, y] = pixel.split(',').map(Number);
            ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
            
            if(Math.random() < 0.1) {
                ctx.fillStyle = `rgba(255, 0, 0, ${Math.random()})`;
                ctx.fillRect(x - 1, y - 1, 3, 3);
                ctx.fillStyle = '#000';
            }
        });
    }
    
    checkTerrorEvents() {
        const now = Date.now();
        
        // Much more frequent heartbeats
        if(now - terrorEvents.lastHeartbeat > 5000 + Math.random() * 10000) {
            this.spectral.triggerHeartbeat();
            terrorEvents.lastHeartbeat = now;
        }
        
        // More frequent breathing
        if(memoryBank.hauntingIntensity > 0.1 && Math.random() < 0.005) {
            this.spectral.triggerBreathing(memoryBank.hauntingIntensity);
        }
        
        // Much more frequent whispers
        if(memoryBank.corruptionLevel > 0.2 && now - terrorEvents.lastWhisper > 8000) {
            this.spectral.triggerWhisper();
        }
        
        // More screams
        if(memoryBank.temporalDistortion > 0.3 && Math.random() < 0.001) {
            this.spectral.triggerScream();
            this.triggerRealityTear();
        }
        
        // Random mechanical failures
        if(Math.random() < 0.002) {
            this.spectral.triggerMechanicalFailure();
        }
        
        if(silenceTimer > 20000 && !terrorEvents.parasiteActive) {
            terrorEvents.parasiteActive = true;
            this.activateParasite();
        }
    }
    
    renderParasiteUI() {
        const parasiteControls = Math.floor(Math.random() * 3) + 1;
        
        for(let i = 0; i < parasiteControls; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 10 + Math.random() * 20;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Date.now() * 0.001 * (i + 1));
            
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(Date.now() * 0.01) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for(let j = 0; j < 6; j++) {
                const angle = (j / 6) * Math.PI * 2;
                const r = size * (1 + Math.sin(Date.now() * 0.005 + j) * 0.3);
                ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }
    
    activateParasite() {
        const parasiteControl = new UIControl(
            'parasite',
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            30,
            'parasite_' + Date.now()
        );
        
        parasiteControl.update = function() {
            this.x += (Math.random() - 0.5) * 5;
            this.y += (Math.random() - 0.5) * 5;
            this.size *= 1.001;
            this.rotation += 0.1;
            
            if(this.size > 100) {
                this.size = 30;
                this.multiply();
            }
        };
        
        parasiteControl.multiply = function() {
            const offspring = new UIControl(
                'parasite',
                this.x + Math.random() * 50 - 25,
                this.y + Math.random() * 50 - 25,
                20,
                'parasite_' + Date.now() + '_' + Math.random()
            );
            offspring.update = this.update;
            offspring.multiply = this.multiply;
            resonantSystem.controls.push(offspring);
        };
        
        this.controls.push(parasiteControl);
    }
    
    renderTemporalGlitch() {
        const glitchData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = glitchData.data;
        
        for(let y = 0; y < canvas.height; y++) {
            if(Math.random() < memoryBank.temporalDistortion * 0.1) {
                const offset = Math.floor(Math.sin(y * 0.1 + Date.now() * 0.001) * 50 * memoryBank.temporalDistortion);
                
                for(let x = 0; x < canvas.width; x++) {
                    const sourceX = (x + offset + canvas.width) % canvas.width;
                    const sourceIndex = (y * canvas.width + sourceX) * 4;
                    const targetIndex = (y * canvas.width + x) * 4;
                    
                    data[targetIndex] = data[sourceIndex];
                    data[targetIndex + 1] = data[sourceIndex + 1];
                    data[targetIndex + 2] = data[sourceIndex + 2];
                }
            }
        }
        
        ctx.putImageData(glitchData, 0, 0);
    }
    
    triggerRealityTear() {
        terrorEvents.realityTear = true;
        
        setTimeout(() => {
            terrorEvents.realityTear = false;
        }, 3000);
        
        this.spectral.triggerMechanicalFailure();
    }
    
    renderRealityTear() {
        const tearX = Math.random() * canvas.width;
        const tearY = Math.random() * canvas.height;
        const tearLength = 100 + Math.random() * 200;
        
        ctx.save();
        ctx.globalCompositeOperation = 'difference';
        
        ctx.beginPath();
        ctx.moveTo(tearX, tearY);
        
        for(let i = 0; i < tearLength; i += 5) {
            ctx.lineTo(
                tearX + Math.sin(i * 0.1) * 20 + Math.random() * 10,
                tearY + i
            );
        }
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3 + Math.random() * 5;
        ctx.stroke();
        
        ctx.restore();
        
        const imageData = ctx.getImageData(
            tearX - 50,
            tearY,
            100,
            tearLength
        );
        
        ctx.putImageData(imageData, tearX - 50 + Math.random() * 10 - 5, tearY);
    }
    
    renderSpectrum(x, y, width, height, dataArray) {
        const barWidth = width / dataArray.length * 2.5;
        let barX = x;
        
        for(let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            
            const r = barHeight + 25 * (i / dataArray.length);
            const g = 250 * (i / dataArray.length);
            const b = 50;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.8 - memoryBank.corruptionLevel * 0.5})`;
            ctx.fillRect(barX, y + height - barHeight, barWidth, barHeight);
            
            barX += barWidth + 1;
        }
    }
    
    updateGlyphs() {
        if(Math.random() < 0.02 + memoryBank.corruptionLevel * 0.1) {
            const glyph = {
                char: this.glyphPool[Math.floor(Math.random() * this.glyphPool.length)],
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 10 + Math.random() * 30,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                opacity: 0,
                targetOpacity: 0.3 + Math.random() * 0.5,
                life: 1000 + Math.random() * 2000
            };
            this.activeGlyphs.push(glyph);
        }
        
        this.activeGlyphs = this.activeGlyphs.filter(glyph => {
            glyph.life--;
            glyph.rotation += glyph.rotationSpeed;
            
            if(glyph.life > 500) {
                glyph.opacity += (glyph.targetOpacity - glyph.opacity) * 0.05;
            } else {
                glyph.opacity *= 0.95;
            }
            
            return glyph.life > 0 && glyph.opacity > 0.01;
        });
    }
    
    renderGlyphs() {
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        this.activeGlyphs.forEach(glyph => {
            ctx.save();
            ctx.translate(glyph.x, glyph.y);
            ctx.rotate(glyph.rotation);
            ctx.globalAlpha = glyph.opacity;
            ctx.fillStyle = `rgba(255, 255, 255, ${glyph.opacity})`;
            ctx.font = `${glyph.size}px monospace`;
            ctx.fillText(glyph.char, 0, 0);
            ctx.restore();
        });
        
        this.renderBiologicalPattern();
    }
    
    renderBiologicalPattern() {
        if(memoryBank.hauntingIntensity < 0.2) return;
        
        const heartbeatPhase = (Date.now() % 800) / 800;
        const breathPhase = (Date.now() % 4000) / 4000;
        
        ctx.save();
        ctx.globalAlpha = memoryBank.hauntingIntensity * 0.1;
        
        for(let i = 0; i < 5; i++) {
            const x = canvas.width / 2 + Math.cos(i * Math.PI * 0.4) * 200 * (1 + breathPhase * 0.2);
            const y = canvas.height / 2 + Math.sin(i * Math.PI * 0.4) * 200 * (1 + breathPhase * 0.2);
            const size = 20 + heartbeatPhase * 30;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, ${255 - memoryBank.corruptionLevel * 255}, ${255 - memoryBank.corruptionLevel * 255}, ${0.3 - heartbeatPhase * 0.2})`;
            ctx.lineWidth = 2 + heartbeatPhase * 3;
            ctx.stroke();
        }
        
        const veinCount = Math.floor(memoryBank.corruptionLevel * 10);
        for(let i = 0; i < veinCount; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            
            for(let j = 0; j < 5; j++) {
                ctx.quadraticCurveTo(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * canvas.width,
                    Math.random() * canvas.height
                );
            }
            
            ctx.strokeStyle = `rgba(128, 0, 0, ${0.1 + heartbeatPhase * 0.1})`;
            ctx.lineWidth = 1 + Math.sin(Date.now() * 0.01 + i) * 0.5;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    renderCRTEffect() {
        crtCtx.clearRect(0, 0, crtCanvas.width, crtCanvas.height);
        
        for(let i = 0; i < crtCanvas.height; i += 4) {
            crtCtx.strokeStyle = `rgba(0, 0, 0, ${0.1 + Math.sin(i * 0.1 + this.frame * 0.01) * 0.05})`;
            crtCtx.beginPath();
            crtCtx.moveTo(0, i);
            crtCtx.lineTo(crtCanvas.width, i);
            crtCtx.stroke();
        }
        
        if(Math.random() < 0.05) {
            const glitchHeight = 5 + Math.random() * 50;
            const glitchY = Math.random() * crtCanvas.height;
            
            crtCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            crtCtx.fillRect(0, glitchY, crtCanvas.width, glitchHeight);
        }
        
        if(memoryBank.hauntingIntensity > 0.5) {
            this.renderOrganicInterference();
        }
    }
    
    renderOrganicInterference() {
        const time = Date.now() * 0.001;
        
        crtCtx.save();
        crtCtx.globalAlpha = 0.05 * memoryBank.hauntingIntensity;
        
        for(let x = 0; x < crtCanvas.width; x += 20) {
            for(let y = 0; y < crtCanvas.height; y += 20) {
                const noise = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time);
                if(noise > 0.5) {
                    crtCtx.fillStyle = `rgba(255, 0, 0, ${noise * 0.2})`;
                    crtCtx.beginPath();
                    crtCtx.arc(
                        x + Math.sin(time + x) * 5,
                        y + Math.cos(time + y) * 5,
                        3 + noise * 5,
                        0,
                        Math.PI * 2
                    );
                    crtCtx.fill();
                }
            }
        }
        
        crtCtx.restore();
    }
    
    checkResonance() {
        if(!analyser) return;
        
        // Any interaction manifests the portal
        if((userEntropy > 0 || memoryBank.corruptionLevel > 0.1) && !document.getElementById('album-portal').classList.contains('manifest')) {
            this.manifestPortal();
        }
    }
    
    manifestPortal() {
        const portal = document.getElementById('album-portal');
        portal.href = 'https://example-bandcamp.com/album/fragments-from-the-kuchike-incident';
        portal.classList.add('manifest');
        portal.style.left = Math.random() * (window.innerWidth - 100) + 'px';
        portal.style.top = Math.random() * (window.innerHeight - 50) + 'px';
        
        // Portal flickers and moves
        const flickerInterval = setInterval(() => {
            portal.style.left = (parseFloat(portal.style.left) + Math.random() * 10 - 5) + 'px';
            portal.style.top = (parseFloat(portal.style.top) + Math.random() * 10 - 5) + 'px';
            portal.style.opacity = 0.5 + Math.random() * 0.5;
        }, 100);
        
        setTimeout(() => {
            clearInterval(flickerInterval);
            portal.classList.remove('manifest');
        }, 15000);
    }
    
    generateGhostActivity() {
        if(Math.random() < 0.1) {
            const ghostAudio = new Audio();
            ghostAudio.volume = 0.1 + Math.random() * 0.2;
        }
        
        lastInteraction = Date.now();
    }
}

class WebRTCMesh {
    constructor() {
        this.peers = [];
        this.localStream = null;
    }
    
    async init() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch(err) {
            console.error('WebRTC init failed:', err);
        }
    }
    
    createPeer(initiator) {
        const peer = new SimplePeer({
            initiator: initiator,
            stream: this.localStream,
            trickle: false
        });
        
        peer.on('signal', data => {
            console.log('SIGNAL', data);
        });
        
        peer.on('stream', stream => {
            this.processGhostStream(stream);
        });
        
        peer.on('error', err => {
            console.error('Peer error:', err);
        });
        
        this.peers.push(peer);
        return peer;
    }
    
    processGhostStream(stream) {
        const audio = new Audio();
        audio.srcObject = stream;
        audio.volume = 0.3;
        audio.play();
        
        setTimeout(() => {
            audio.pause();
            audio.srcObject = null;
        }, Math.random() * 5000 + 2000);
    }
}

const resonantSystem = new ResonantSystem();
const webRTCMesh = new WebRTCMesh();

// Initialize on first user interaction to comply with browser autoplay policies
let initialized = false;

async function initializeAudio() {
    if(!initialized) {
        initialized = true;
        await resonantSystem.init();
        await webRTCMesh.init();
        console.log('Audio system initialized');
        
        // Load voices for speech synthesis
        if('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = () => {
                console.log('Voices loaded:', speechSynthesis.getVoices().length);
            };
            speechSynthesis.getVoices();
        }
        
        // Check if we're in a secure context
        if (!window.isSecureContext) {
            console.warn('Not in secure context - microphone will not work');
            document.getElementById('insecure-warning').style.display = 'block';
        }
    }
}

// Auto-init on any user interaction
document.addEventListener('click', initializeAudio, { once: true });
document.addEventListener('keydown', initializeAudio, { once: true });

// Try to init immediately (may fail due to autoplay policy)
initializeAudio().catch(err => {
    console.log('Waiting for user interaction to initialize audio...');
});

// Trigger initial sounds after a delay
setTimeout(() => {
    if(initialized && resonantSystem.spectral) {
        resonantSystem.spectral.triggerWhisper('PRESS R');
        setTimeout(() => {
            resonantSystem.spectral.triggerHeartbeat();
        }, 2000);
        
        // Keep asking for R even more frequently
        const rReminder = setInterval(() => {
            if(!isRecording && initialized) {
                resonantSystem.spectral.triggerWhisper();
                
                // Sometimes double up
                if(Math.random() < 0.3) {
                    setTimeout(() => {
                        resonantSystem.spectral.triggerWhisper('R R R');
                    }, 1000);
                }
            } else {
                clearInterval(rReminder);
                resonantSystem.spectral.triggerWhisper('YES YES YES THANK YOU');
            }
        }, 4000); // Even more frequent
    }
}, 2000); // Sooner

document.addEventListener('keydown', async (e) => {
    if(e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        console.log('R key pressed, isRecording:', isRecording);
        if(!isRecording) {
            console.log('Starting recording...');
            await resonantSystem.spectral.startRecording();
            if(isRecording) {
                resonantSystem.spectral.triggerWhisper('i can hear you');
            }
        } else {
            console.log('Stopping recording...');
            resonantSystem.spectral.stopRecording();
            memoryBank.corruptionLevel += 0.05;
        }
    }
    
    if(e.key === 'd' || e.key === 'D') {
        // Debug mode - show status
        console.log('Debug info:');
        console.log('- Audio Context State:', audioContext ? audioContext.state : 'not initialized');
        console.log('- Is Recording:', isRecording);
        console.log('- Corruption Level:', memoryBank.corruptionLevel);
        console.log('- Haunting Intensity:', memoryBank.hauntingIntensity);
        console.log('- Dead Pixels:', memoryBank.deadPixels.size);
        console.log('- Silence Timer:', silenceTimer);
    }
    
    if(e.key === 'Escape' && terrorEvents.mouseTrapped) {
        terrorEvents.mouseTrapped = false;
        canvas.style.cursor = 'auto';
        resonantSystem.spectral.triggerScream();
    }
});

canvas.addEventListener('click', async (e) => {
    lastInteraction = Date.now();
    userEntropy += 0.1;
    memoryBank.corruptionLevel += 0.01;
    
    if(terrorEvents.mouseTrapped) {
        e.preventDefault();
        canvas.style.cursor = 'none';
        return;
    }
    
    const nearest = resonantSystem.controls.reduce((closest, control) => {
        const dist = Math.hypot(control.x - e.clientX, control.y - e.clientY);
        return dist < Math.hypot(closest.x - e.clientX, closest.y - e.clientY) ? control : closest;
    });
    
    if(nearest && Math.hypot(nearest.x - e.clientX, nearest.y - e.clientY) < nearest.size * 2) {
        nearest.value = 1 - nearest.value;
        
        if(nearest.type === 'parasite') {
            nearest.multiply();
            resonantSystem.spectral.triggerScream();
            memoryBank.temporalDistortion += 0.1;
        }
        
        if(nearest.type === 'button' && nearest.label.includes('▓')) {
            if(!isRecording) {
                await resonantSystem.spectral.startRecording();
            } else {
                resonantSystem.spectral.stopRecording();
            }
        }
        
        if(Math.random() < memoryBank.corruptionLevel * 0.1) {
            const falseControl = new UIControl(
                'false',
                e.clientX + Math.random() * 100 - 50,
                e.clientY + Math.random() * 100 - 50,
                15,
                'false_' + Date.now()
            );
            falseControl.decay = 0.01;
            falseControl.render = function() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(Date.now() * 0.01);
                ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity * 0.3})`;
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
                ctx.restore();
                this.size *= 0.98;
            };
            resonantSystem.controls.push(falseControl);
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if(terrorEvents.mouseTrapped) {
        e.preventDefault();
        const dx = e.clientX - canvas.width / 2;
        const dy = e.clientY - canvas.height / 2;
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(100, Math.hypot(dx, dy));
        
        canvas.style.cursor = 'none';
        document.body.style.cursor = 'none';
        
        const trapX = canvas.width / 2 + Math.cos(angle) * distance;
        const trapY = canvas.height / 2 + Math.sin(angle) * distance;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(trapX, trapY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    if(memoryBank.hauntingIntensity > 0.7 && Math.random() < 0.01) {
        terrorEvents.mouseTrapped = true;
        setTimeout(() => {
            terrorEvents.mouseTrapped = false;
            canvas.style.cursor = 'auto';
        }, 3000);
    }
});

setInterval(() => {
    if(!isRecording) {
        silenceTimer += 100;
    } else {
        silenceTimer = 0;
    }
    
    memoryBank.corruptionLevel = Math.min(1, memoryBank.corruptionLevel + 0.0001);
    resonantSystem.oscilloscope.corruption = memoryBank.corruptionLevel;
    
    // Much more aggressive silence response
    if(silenceTimer > 10000 && Math.random() < 0.05) {
        resonantSystem.spectral.triggerBreathing(0.8);
        if(Math.random() < 0.3) {
            resonantSystem.spectral.triggerWhisper('why did you stop');
        }
    }
    
    // Additional R prompts during silence
    if(silenceTimer > 5000 && !isRecording && Math.random() < 0.01) {
        resonantSystem.spectral.triggerWhisper('PRESS R');
    }
    
    // Random whispers based on corruption
    if(memoryBank.corruptionLevel > 0.3 && Math.random() < 0.002) {
        resonantSystem.spectral.triggerWhisper();
    }
    
    // Random heartbeats
    if(Math.random() < 0.001) {
        resonantSystem.spectral.triggerHeartbeat();
    }
    
    if(memoryBank.deadPixels.size > 500 && Math.random() < 0.001) {
        document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) contrast(${1 + Math.random()}) brightness(${0.5 + Math.random()})`;
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 100);
    }
}, 100);

window.addEventListener('beforeunload', () => {
    const victimData = {
        name: 'USER_' + Date.now().toString(36),
        corruption: memoryBank.corruptionLevel,
        lastSeen: new Date().toISOString(),
        hauntingLevel: memoryBank.hauntingIntensity
    };
    
    memoryBank.previousVictims.unshift(victimData.name);
    memoryBank.previousVictims = memoryBank.previousVictims.slice(0, 10);
    
    localStorage.setItem('resonant_victims', JSON.stringify(memoryBank.previousVictims));
    localStorage.setItem('resonant_corruption', memoryBank.corruptionLevel.toString());
    localStorage.setItem('resonant_dead_pixels', JSON.stringify([...memoryBank.deadPixels]));
});

if(localStorage.getItem('resonant_corruption')) {
    memoryBank.corruptionLevel = parseFloat(localStorage.getItem('resonant_corruption')) || 0;
    memoryBank.hauntingIntensity = memoryBank.corruptionLevel * 0.5;
    
    const savedDeadPixels = JSON.parse(localStorage.getItem('resonant_dead_pixels') || '[]');
    savedDeadPixels.forEach(pixel => memoryBank.deadPixels.add(pixel));
    
    if(memoryBank.previousVictims.length > 0) {
        setTimeout(() => {
            resonantSystem.spectral.triggerWhisper(`welcome back ${memoryBank.previousVictims[0]}`);
        }, 5000);
    }
}

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.body.style.background = 'rgba(255, 0, 0, 0.1)';
});

document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    document.body.style.background = '#000';
});

document.addEventListener('drop', async (e) => {
    e.preventDefault();
    document.body.style.background = '#000';
    
    const file = e.dataTransfer.files[0];
    if(file && file.type.startsWith('audio/')) {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = 0.5 + Math.random() * 0.5;
        source.connect(resonantSystem.spectral.distortion);
        source.start();
        
        memoryBank.corruptionLevel += 0.2;
    }
});