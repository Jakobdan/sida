
//The URL to which we will send the request
const url = 'http://localhost:3000/api/v1/tunes';

// Initialize  synth or sampler
const synth = new Tone.Synth().toDestination();

const keyMap = {
  'a': 'c4',
  's': 'd4',
  'd': 'e4',
  'f': 'f4',
  'g': 'g4',
  'h': 'a4',
  'j': 'b4',
  'k': 'c5',
  'l': 'd5',
  ';': 'e5',
  'w': 'c#4',
  'e': 'd#4',
  't': 'f#4',
  'y': 'g#4',
  'u': 'bb4',
  'o': 'c#5',
  'p': 'd#5',
  'æ': 'e5',
};
// get the tunes 
const getAllTunes = async () => {
  try {
      const response = await axios.get(url)
      
      console.log("Success: ", response.data);
      tunes = response.data;

      add_to_Selector()

    } catch (error) {
        console.error("Failed to fetch tunes: ", error);
    }
  // This code is always executed, independent of whether the request succeeds or fails.
}
async function startsum(){
  await Tone.start();  
};
document.addEventListener('DOMContentLoaded',startsum)
document.addEventListener('DOMContentLoaded',getAllTunes)



// play the note and if recording log the noted and time played
const keyClick = (note) => {
  synth.triggerAttackRelease(note, "8n"); // allways the same duration
  if (isRecording) {
    const recTiming = (Date.now() - startTime)/1000;
    recording.push({ note: note, duration: "8n", timing: recTiming});
  }
};

// post the recorded tune to the backend
const makeTune = async () => {

  const recordName = document.getElementById("recordName").value || "No-name Tune";

  try {
    const postResponse = await axios.post(url, {name: recordName,tune: recording,});

    console.log("Successfully written: ", postResponse.data);
    
    get_and_addTunes(); //add the new tunes to the selector
  } catch (error) {
    console.log(error);
  }
};

// get the data from the backend and add to the selector
const get_and_addTunes = async () => {
  try {
    const response = await axios(url);
    console.log("Success: ", response.data);
    tunes = response.data;
    add_to_Selector();
  } catch (error) {
    console.log(error);
  }
};

// add the tunes to the dropdown
const add_to_Selector = () => {
  const dropdown = document.getElementById("tunesDrop");
  dropdown.innerHTML = "";

  tunes.forEach((tune, id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = tune.name;
    dropdown.appendChild(option);
  });
};

// variables for recording the tunes
let tunes = [];
let recording = [];
let isRecording = false;
let startTime = 0;

// Play by clicking the buttons
document.querySelectorAll(".whitebtn, .blackbtn").forEach((key) => {
  key.addEventListener("click", (event) => {
    keyClick(event.target.id); 
  });
});

// Play with keyboard
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  // Match key pressed to a note with a keymap
  const note = keyMap[e.key];
  // If it finds the note in the keymap and the record name box is not active
  if (note && document.activeElement.id !== "recordName") {
      keyClick(note) // Play the note

      const button = document.getElementById(note); // Find the right button 
      // Change the style of the button.
      if (button) {
          button.classList.add('active-style');
          setTimeout(() => {button.classList.remove('active-style');}, 200); 
      }
      
  }
});

// Tune button
document.getElementById("tunebtn").addEventListener("click", (e) => {

  const selectedTuneId = tunes[document.getElementById("tunesDrop").value].id;
  const tune = tunes.find(t => t.id == selectedTuneId).tune;
  const now = Tone.now();

  tune.forEach((tune) => {
    const {note, duration, timing } = tune;
    const duration_sek = 200/8*parseInt(duration.slice(0, -1));
    const button = document.getElementById(note.toLowerCase());

    synth.triggerAttackRelease(note, duration, now + timing);

    if (button) {
      setTimeout(() => {
        button.classList.add('active-style');
      }, timing*1000);
      setTimeout(() => {
        button.classList.remove('active-style');
      }, timing*1000 + duration_sek); // Convert 'duration' to milliseconds
    }
  });
});

// Recording button
document.getElementById("recordbtn").addEventListener("click", (e) => {
  const recordButton = document.getElementById("recordbtn");
  const stopButton = document.getElementById("stopbtn");
  recordButton.disabled = true;
  stopButton.disabled = false;
  document.activeElement.blur();

  recording = [];
  startTime = Date.now();
  isRecording = true;
});
// Stop button
document.getElementById("stopbtn").addEventListener("click", (e) => {

  const recordButton = document.getElementById("recordbtn");
  const stopButton = document.getElementById("stopbtn");

  recordButton.disabled = false;
  stopButton.disabled = true;

  startTime = 0;
  isRecording = false;

  if (recording.length > 0) {
    makeTune();
  }
});



