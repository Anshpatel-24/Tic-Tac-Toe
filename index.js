let currentPlayer = document.getElementById("current-Player");

let player1; 
let player2; 

let btnX = [];
let btnO = [];

let presscount;

let P1score = 0;
let P2score = 0;

let flag = true;

function GameStart() {

    btnX = [];
    btnO = [];

    presscount = false;

    let allGameBtns = document.getElementsByClassName("gameBTNs");
    for(let i = 0; i < allGameBtns.length ; i++){
        allGameBtns[i].disabled = false;
        allGameBtns[i].innerText = "";
        allGameBtns[i].style.backgroundColor = "#a2e0fa";
        allGameBtns[i].style.border = "3px solid #007bff";
        
        allGameBtns[i].classList.remove("show-win-animation");
    }
    
    if(flag){
        player1 = document.getElementById("player1").value;
        player2 = document.getElementById("player2").value;
        flag = false;
    }
    
    if(player1 === "" || player2 === "") {
        alert("Please enter names for both players.");
        return;
    }

    document.querySelector("#resetBTN").style.display = "block";
    document.querySelector("#rePlayBTN").style.display = "block";

    let startBTN = document.getElementById("start-game");

    startBTN.style.display = "none";
    document.getElementById("game-board").style.display = "block";


    let p1_cont = document.querySelector("#p1container");
    p1_cont.innerHTML = `
        <div class="P_lables" id="Player-1">
            ${player1}'s Winning Score : <span>${P1score}</span>
        </div>`;


    let p2_cont = document.querySelector("#p2container");
    p2_cont.innerHTML = `
        <div class="P_lables" id="Player-2">
            ${player2}'s Winning Score : <span>${P2score}</span>
        </div>
        `;

    
    currentPlayer.style.display = "block";
    currentPlayer.style.backgroundColor = "rgb(167, 248, 167)";
    currentPlayer.style.color = "darkgreen";
    currentPlayer.style.border = "3px solid rgb(108 204 117)";
    currentPlayer.innerText = `${player1}'s Turn`;
    
}


function pressBTN(id) {
    let btn = document.getElementById(id);
    if(!presscount){

        currentPlayer.innerText = `${player2}'s Turn`;
        currentPlayer.style.backgroundColor = "#ffffaf";
        currentPlayer.style.color = "#b98800";
        currentPlayer.style.border = "3px solid #ccaa6c";

        btn.innerText = "X";
        btn.style.color = "#0ab900";
        btn.style.backgroundColor = "rgb(175 255 176)"; 
        btn.style.border = "5px solid rgb(108 204 117)";
        btn.disabled = true;
        presscount = true;

        btnX.push(btn.id[5]);

        if(btnX.length >= 3){
            P1score = winCheck(btnX , player1 , P1score);

            let player1_Info = document.getElementById("Player-1");
            player1_Info.innerHTML = ` ${player1}'s Winning Score : <span>${P1score}</span>`;
        }

    } else {

        currentPlayer.innerText = `${player1}'s Turn`;
        currentPlayer.style.backgroundColor = "rgb(175 255 176)";
        currentPlayer.style.color = "darkgreen";
        currentPlayer.style.border = "3px solid rgb(108 204 117)";

        btn.innerText = "O";
        btn.style.color = "#b98800";
        btn.style.backgroundColor = "#ffffaf";
        btn.style.border = "5px solid #ccaa6c";
        btn.disabled = true;
        presscount = false;

        btnO.push(btn.id[5]);

        if(btnO.length >= 3){
            P2score = winCheck(btnO , player2 , P2score);

            let player2_Info = document.getElementById("Player-2");
            player2_Info.innerHTML = ` ${player2}'s Winning Score : <span>${P2score}</span>`;
        }
    }
}

let win = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]];
let tie = 0;

function winCheck(btnNo , name , score) {

    let tieCheck = true;
    let checkBTNs = 0;

    for(let i = 0 ; i < win.length ; i++){
        for(let j = 0 ; j < 3 ; j++){
            for(let k=0; k<5; k++){
                if(win[i][j] == btnNo[k]){
                    checkBTNs++;
                }
            }
        }

        if(checkBTNs === 3){
            score++;
            tieCheck = false;

            currentPlayer.innerText = `${name} win the game.`;
            currentPlayer.style.backgroundColor = "#a2e0fa";
            currentPlayer.style.color = "darkblue";
            currentPlayer.style.border = "5px solid blue";
            showResultPopup();

            for(let a = 0; a < 3; a++){
                let btns = document.querySelector(`#gBTN-${win[i][a]}`);

                // btns.style.border = "2vmin solid orange";
                btns.classList.add("show-win-animation");
                
                // btns.style.border = "10px solid red";
                // btns.style.backgroundColor = "yellow";
                // btns.style.color = "orange";
            }

            let allGameBtns = document.getElementsByClassName("gameBTNs");
            for(let i = 0; i < allGameBtns.length ; i++){
                allGameBtns[i].disabled = true;
            }

            checkBTNs = 0;
            return score;
        }
        checkBTNs = 0;
    }

    if(tieCheck && btnNo.length == 5){
        tie++;

        currentPlayer.innerText = `The game is Tie.`;
        currentPlayer.style.backgroundColor = "#a2e0fa";
        currentPlayer.style.color = "darkblue";
        currentPlayer.style.border = "5px solid blue";
        showResultPopup();

        let Tie_sec = document.querySelector("#Tie");
        Tie_sec.style.display = "block";
        Tie_sec.innerHTML = `
                Tie Matches : <span>${tie}</span>
        `;
    }

    return score;
}

function showResultPopup() {
    if (currentPlayer) {
        currentPlayer.classList.remove('show-popup');
        // Force reflow for restart animation
        void currentPlayer.offsetWidth;
        currentPlayer.classList.add('show-popup');
    }
}