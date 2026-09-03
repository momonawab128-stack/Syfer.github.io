let xp=0,coins=100,played=0,wins=0;

const modal=document.getElementById("modal");
const game=document.getElementById("game");

let timer=null;
let animation=null;

function stats(){
    document.getElementById("xp").textContent=xp;
    document.getElementById("coins").textContent=coins;
    document.getElementById("played").textContent=played;
    document.getElementById("wins").textContent=wins;
    document.getElementById("level").textContent="LVL "+(Math.floor(xp/100)+1);
}

function reward(n=10){
    xp+=n;
    coins+=Math.max(1,Math.floor(n/3));
    stats();
}

function win(n=25){
    wins++;
    played++;
    xp+=n;
    coins+=Math.floor(n/2);
    stats();
}

function lose(){
    played++;
    stats();
}

function openGame(name){

    modal.classList.add("active");

    if(timer) clearInterval(timer);
    if(animation) cancelAnimationFrame(animation);
    if(reactionTimeout) clearTimeout(reactionTimeout);

    document.onkeydown=null;

    const games={
        snake,
        breakout,
        pong,
        space,
        flappy,
        aim,
        reaction,
        memory,
        mole,
        typing
    };

    if(games[name]) games[name]();
}

function closeGame(){

    modal.classList.remove("active");
    game.innerHTML="";

    if(timer) clearInterval(timer);
    if(animation) cancelAnimationFrame(animation);
    if(reactionTimeout) clearTimeout(reactionTimeout);

    document.onkeydown=null;
}

function btn(text,fn){
    return `<button class="game-btn" onclick="${fn}">${text}</button>`;
}

function random(a){
    return a[Math.floor(Math.random()*a.length)];
}


/* ================= SNAKE ================= */

function snake(){

    game.innerHTML=`
        <h2>🐍 SNAKE</h2>
        <p>Use Arrow Keys. Eat the yellow food.</p>
        <canvas id="c" width="360" height="360"></canvas>
        <p id="score">Score: 0</p>
        ${btn("RESTART","snake()")}
    `;

    const c=document.getElementById("c");
    const ctx=c.getContext("2d");

    const size=18;

    let body=[
        {x:180,y:180},
        {x:162,y:180},
        {x:144,y:180}
    ];

    let dx=size,dy=0;
    let score=0;
    let alive=true;

    let food=makeFood();

    document.onkeydown=e=>{

        if(e.key==="ArrowUp" && dy===0){
            dx=0;dy=-size;
        }

        if(e.key==="ArrowDown" && dy===0){
            dx=0;dy=size;
        }

        if(e.key==="ArrowLeft" && dx===0){
            dx=-size;dy=0;
        }

        if(e.key==="ArrowRight" && dx===0){
            dx=size;dy=0;
        }
    };

    function makeFood(){

        return {
            x:Math.floor(Math.random()*20)*size,
            y:Math.floor(Math.random()*20)*size
        };
    }

    function loop(){

        if(!alive)return;

        const head={
            x:body[0].x+dx,
            y:body[0].y+dy
        };

        if(
            head.x<0 || head.y<0 ||
            head.x>=360 || head.y>=360 ||
            body.some(p=>p.x===head.x&&p.y===head.y)
        ){
            alive=false;
            lose();
            return;
        }

        body.unshift(head);

        if(head.x===food.x && head.y===food.y){

            score++;
            document.getElementById("score").textContent="Score: "+score;
            food=makeFood();

        }else{
            body.pop();
        }

        ctx.clearRect(0,0,360,360);

        ctx.fillStyle="#ff174f";

        body.forEach(p=>{
            ctx.fillRect(p.x,p.y,size-2,size-2);
        });

        ctx.fillStyle="#ffd43b";
        ctx.fillRect(food.x,food.y,size-2,size-2);

        timer=setTimeout(loop,100);
    }

    loop();
}


/* ================= BREAKOUT ================= */

function breakout(){

    game.innerHTML=`
        <h2>🧱 BREAKOUT</h2>
        <p>Move your mouse to control the paddle.</p>
        <canvas id="c" width="520" height="360"></canvas>
        <p id="score">Bricks: 0</p>
        ${btn("RESTART","breakout()")}
    `;

    const c=document.getElementById("c");
    const ctx=c.getContext("2d");

    let x=260,y=300;
    let dx=4,dy=-4;
    let paddle=210;
    let destroyed=0;

    const bricks=[];

    for(let r=0;r<5;r++){
        for(let col=0;col<8;col++){
            bricks.push({
                x:5+col*64,
                y:20+r*25,
                hit:false
            });
        }
    }

    c.onmousemove=e=>{
        const rect=c.getBoundingClientRect();
        paddle=e.clientX-rect.left-50;
        paddle=Math.max(0,Math.min(420,paddle));
    };

    function loop(){

        ctx.clearRect(0,0,520,360);

        ctx.fillStyle="#ff174f";

        bricks.forEach(b=>{
            if(!b.hit)ctx.fillRect(b.x,b.y,58,18);
        });

        ctx.fillRect(paddle,335,100,10);

        ctx.beginPath();
        ctx.arc(x,y,7,0,Math.PI*2);
        ctx.fill();

        x+=dx;
        y+=dy;

        if(x<7||x>513)dx=-dx;
        if(y<7)dy=-dy;

        if(y>325&&x>paddle&&x<paddle+100){
            dy=-Math.abs(dy);
        }

        bricks.forEach(b=>{

            if(
                !b.hit &&
                x>b.x &&
                x<b.x+58 &&
                y>b.y &&
                y<b.y+18
            ){

                b.hit=true;
                dy=-dy;
                destroyed++;

                document.getElementById("score").textContent=
                    "Bricks: "+destroyed;
            }
        });

        if(destroyed===bricks.length){
            win(100);
            return;
        }

        if(y>360){
            lose();
            return;
        }

        animation=requestAnimationFrame(loop);
    }

    loop();
}


/* ================= PONG ================= */

function pong(){

    game.innerHTML=`
        <h2>🏓 PONG</h2>
        <p>Move mouse up/down to control your paddle.</p>
        <canvas id="c" width="520" height="320"></canvas>
        ${btn("RESTART","pong()")}
    `;

    const c=document.getElementById("c");
    const ctx=c.getContext("2d");

    let player=120;
    let cpu=120;

    let ball={
        x:260,
        y:160,
        dx:5,
        dy:3
    };

    c.onmousemove=e=>{
        const rect=c.getBoundingClientRect();
        player=e.clientY-rect.top-40;
    };

    function loop(){

        ctx.clearRect(0,0,520,320);

        ctx.fillStyle="#fff";

        ctx.fillRect(10,player,10,80);
        ctx.fillRect(500,cpu,10,80);

        ctx.beginPath();
        ctx.arc(ball.x,ball.y,8,0,Math.PI*2);
        ctx.fill();

        ball.x+=ball.dx;
        ball.y+=ball.dy;

        if(ball.y<8||ball.y>312)ball.dy*=-1;

        cpu+=(ball.y-(cpu+40))*.06;

        if(
            ball.x<25 &&
            ball.y>player &&
            ball.y<player+80
        ){
            ball.dx=Math.abs(ball.dx);
        }

        if(
            ball.x>495 &&
            ball.y>cpu &&
            ball.y<cpu+80
        ){
            ball.dx=-Math.abs(ball.dx);
        }

        if(ball.x<0){
            lose();
            return;
        }

        if(ball.x>520){
            win(40);
            return;
        }

        animation=requestAnimationFrame(loop);
    }

    loop();
}


/* ================= SPACE SHOOTER ================= */

function space(){

    game.innerHTML=`
        <h2>🚀 SPACE SHOOTER</h2>
        <p>← → to move • SPACE to shoot</p>
        <canvas id="c" width="520" height="400"></canvas>
        <p id="score">Score: 0</p>
        ${btn("RESTART","space()")}
    `;

    const c=document.getElementById("c");
    const ctx=c.getContext("2d");

    let player=245;
    let bullets=[];
    let enemies=[];
    let score=0;
    let over=false;

    for(let i=0;i<10;i++){
        enemies.push({
            x:20+i*50,
            y:40,
            alive:true
        });
    }

    document.onkeydown=e=>{

        if(e.key==="ArrowLeft")player-=20;
        if(e.key==="ArrowRight")player+=20;

        player=Math.max(15,Math.min(505,player));

        if(e.code==="Space"){
            bullets.push({
                x:player,
                y:360
            });
        }
    };

    function loop(){

        if(over)return;

        ctx.clearRect(0,0,520,400);

        ctx.fillStyle="#ff174f";
        ctx.fillRect(player-15,370,30,18);

        ctx.fillStyle="#fff";

        bullets.forEach(b=>{
            b.y-=8;
            ctx.fillRect(b.x,b.y,4,12);
        });

        enemies.forEach(e=>{

            if(!e.alive)return;

            ctx.fillRect(e.x,e.y,30,20);

            bullets.forEach(b=>{

                if(
                    b.x>e.x &&
                    b.x<e.x+30 &&
                    b.y>e.y &&
                    b.y<e.y+20
                ){

                    e.alive=false;
                    b.y=-100;

                    score++;

                    document.getElementById("score").textContent=
                        "Score: "+score;
                }
            });
        });

        if(enemies.every(e=>!e.alive)){
            over=true;
            win(100);
            return;
        }

        animation=requestAnimationFrame(loop);
    }

    loop();
}


/* ================= FLAPPY ================= */

function flappy(){

    game.innerHTML=`
        <h2>🐦 FLAPPY X</h2>
        <p>Click or press SPACE to fly.</p>
        <canvas id="c" width="400" height="500"></canvas>
        <p id="score">Score: 0</p>
        ${btn("RESTART","flappy()")}
    `;

    const c=document.getElementById("c");
    const ctx=c.getContext("2d");

    let bird={x:70,y:250,v:0};
    let pipe={x:400,top:100,gap:150};
    let score=0;
    let passed=false;

    function flap(){
        bird.v=-7;
    }

    c.onclick=flap;

    document.onkeydown=e=>{
        if(e.code==="Space")flap();
    };

    function loop(){

        ctx.clearRect(0,0,400,500);

        bird.v+=.35;
        bird.y+=bird.v;

        pipe.x-=3;

        if(pipe.x<-60){

            pipe.x=400;
            pipe.top=50+Math.random()*220;

            score++;

            document.getElementById("score").textContent=
                "Score: "+score;
        }

        ctx.fillStyle="#ff174f";
        ctx.fillRect(bird.x,bird.y,25,25);

        ctx.fillStyle="#fff";

        ctx.fillRect(pipe.x,0,55,pipe.top);

        ctx.fillRect(
            pipe.x,
            pipe.top+pipe.gap,
            55,
            500
        );

        if(
            bird.y<0 ||
            bird.y>475 ||
            (
                bird.x+25>pipe.x &&
                bird.x<pipe.x+55 &&
                (
                    bird.y<pipe.top ||
                    bird.y+25>pipe.top+pipe.gap
                )
            )
        ){
            lose();
            return;
        }

        animation=requestAnimationFrame(loop);
    }

    loop();
}


/* ================= AIM ================= */

function aim(){

    game.innerHTML=`
        <h2>🎯 AIM TRAINER</h2>
        <p>Hit as many targets as possible in 15 seconds.</p>
        <div class="game-area" id="area"></div>
        <h3 id="score">Hits: 0</h3>
        <h3 id="time">15</h3>
        ${btn("RESTART","aim()")}
    `;

    const area=document.getElementById("area");

    let hits=0;
    let time=15;

    function spawn(){

        area.innerHTML="";

        const target=document.createElement("div");

        target.className="target";

        target.style.left=
            Math.random()*(area.clientWidth-45)+"px";

        target.style.top=
            Math.random()*(area.clientHeight-45)+"px";

        target.onclick=()=>{

            hits++;

            document.getElementById("score").textContent=
                "Hits: "+hits;

            spawn();
        };

        area.appendChild(target);
    }

    spawn();

    timer=setInterval(()=>{

        time--;

        document.getElementById("time").textContent=time;

        if(time<=0){

            clearInterval(timer);
            win(Math.min(100,hits*5));
        }

    },1000);
}


/* ================= REACTION ================= */

function reaction(){

    game.innerHTML=`
        <h2>⚡ REACTION TEST</h2>
        <p>Click START, wait for green, then click immediately.</p>

        <div class="game-area" id="area">
            ${btn("START","startReaction()")}
        </div>

        <div id="result"></div>
    `;
}

let reactionTimeout;
let reactionStart;

function startReaction(){

    const area=document.getElementById("area");

    area.innerHTML="<h2 style='padding-top:130px'>WAIT...</h2>";

    reactionTimeout=setTimeout(()=>{

        area.innerHTML=
            "<h2 style='padding-top:130px'>CLICK NOW!</h2>";

        area.style.background="#00a83b";

        reactionStart=performance.now();

        area.onclick=finishReaction;

    },1000+Math.random()*3000);
}

function finishReaction(){

    const ms=Math.round(performance.now()-reactionStart);

    document.getElementById("result").innerHTML=
        `<div class="result">${ms} MS</div>`;

    if(ms<300)win(60);
    else if(ms<500)win(35);
    else reward(10);
}


/* ================= MEMORY ================= */

function memory(){

    const icons=["🍕","🚀","🎮","🔥","🐍","⭐","💎","🍎"];
    const cards=[...icons,...icons].sort(()=>Math.random()-.5);

    game.innerHTML=`
        <h2>🧠 MEMORY MATCH</h2>
        <p>Find all matching pairs.</p>
        <div class="memory" id="memory"></div>
    `;

    const grid=document.getElementById("memory");

    let first=null;
    let lock=false;
    let matched=0;

    cards.forEach(icon=>{

        const card=document.createElement("div");

        card.className="memory-card";
        card.textContent="❔";

        card.onclick=()=>{

            if(lock||card.textContent!=="❔")return;

            card.textContent=icon;

            if(!first){

                first={card,icon};

            }else{

                if(first.icon===icon){

                    matched++;
                    first=null;

                    if(matched===icons.length){
                        win(100);
                    }

                }else{

                    lock=true;

                    setTimeout(()=>{

                        first.card.textContent="❔";
                        card.textContent="❔";

                        first=null;
                        lock=false;

                    },650);
                }
            }
        };

        grid.appendChild(card);
    });
}


/* ================= MOLE ================= */

function mole(){

    game.innerHTML=`
        <h2>🔨 WHACK-A-MOLE</h2>
        <p>Hit the mole before it moves.</p>
        <div class="moles" id="moles"></div>
        <h3 id="score">Score: 0</h3>
        <h3 id="time">15</h3>
        ${btn("RESTART","mole()")}
    `;

    const grid=document.getElementById("moles");

    let score=0;
    let time=15;

    function draw(){

        grid.innerHTML="";

        const moleIndex=
            Math.floor(Math.random()*9);

        for(let i=0;i<9;i++){

            const hole=document.createElement("div");

            hole.className="hole";

            if(i===moleIndex){
                hole.textContent="🐹";

                hole.onclick=()=>{

                    score++;

                    document.getElementById("score").textContent=
                        "Score: "+score;

                    draw();
                };
            }

            grid.appendChild(hole);
        }
    }

    draw();

    timer=setInterval(()=>{

        time--;

        document.getElementById("time").textContent=time;

        draw();

        if(time<=0){

            clearInterval(timer);
            win(score*6);
        }

    },1000);
}


/* ================= TYPING ================= */

function typing(){

    const text=random([
        "The quick brown fox jumps over the lazy dog.",
        "Gaming is the best way to spend your free time.",
        "Welcome to the ultimate browser mini game arcade.",
        "Practice every day and become a better gamer.",
        "Speed accuracy and concentration win the game."
    ]);

    game.innerHTML=`
        <h2>⌨️ TYPING SPEED</h2>

        <div class="typing">${text}</div>

        <input
            class="typing-input"
            id="typingInput"
            placeholder="Type the sentence..."
            autocomplete="off"
        >

        <div id="typingResult"></div>
    `;

    const input=document.getElementById("typingInput");

    let started=false;
    let startTime;

    input.focus();

    input.oninput=()=>{

        if(!started){

            started=true;
            startTime=Date.now();
        }

        if(input.value===text){

            const seconds=
                (Date.now()-startTime)/1000;

            const words=text.split(" ").length;

            const wpm=
                Math.round(words/(seconds/60));

            document.getElementById("typingResult").innerHTML=
                `<div class="result">${wpm} WPM</div>
                 <p>Excellent! 🎉</p>
                 ${btn("PLAY AGAIN","typing()")}`;

            win(Math.min(100,wpm));
        }
    };
}


/* ================= SEARCH / FILTER ================= */

document.getElementById("search").addEventListener("input",function(){

    const value=this.value.toLowerCase();

    document.querySelectorAll(".card").forEach(card=>{

        card.style.display=
            card.dataset.name.includes(value) ? "" : "none";
    });
});

function filterGames(cat){

    document.querySelectorAll(".card").forEach(card=>{

        card.style.display=
            cat==="all"||card.dataset.cat===cat
            ? ""
            : "none";
    });
}

stats();
