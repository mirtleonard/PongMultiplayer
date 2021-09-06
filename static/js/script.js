const roomName = JSON.parse(document.getElementById('room-name').textContent);
const userName = JSON.parse(document.getElementById('user-name').textContent);

const gameSocket = new WebSocket(
    'ws://'
    + window.location.host + '/'
    + roomName
    + '/'
    + userName
    + '/game/'
);

let currentPlayer = 0, gameOver = true, first = true;
let canvas = document.querySelector('canvas');
let width = canvas.width = 700;
let height = canvas.height = 700;
let board = canvas.getContext('2d');
board.strokeStyle = 'white';
board.fillStyle = 'white';
let player = [{}, {}];
let paddle = [{},{}];
let score = [0, 0];

player[0] = {
  score : 0,
  ready : false,
  user_name : userName,
}

player[1] = {
  score : 0,
  ready : false,
  user_name : '',
}

paddle[currentPlayer] = {
  x : width - 30,
  y : height / 2 - 100,
  height : 100,
  width : 10,
  speed : 0,
}

paddle[currentPlayer ^ 1] = {
  x : 20,
  y : height / 2 - 100,
  height: 100,
  width: 10,
  speed: 0,
}

let ball = {
  x : width / 2,
  y : height / 2,
  radius : 10,
  vx : 5,
  vy : 5,
}


function changeState() {
  player[currentPlayer].ready = !player[currentPlayer].ready;
  if (!player[currentPlayer].ready)
    gameOver = true;
  console.log(player[currentPlayer].ready, player[currentPlayer ^ 1].ready, 'aici');// ? "I'm not ready!" : "I'm ready!"));
  document.querySelector('button').innerHTML = player[currentPlayer].ready ? "I'm not ready!" : "I'm ready!";
  gameSocket.send(JSON.stringify({
      user_name : userName,
      player : currentPlayer,
      ready : player[currentPlayer].ready,
      speed : paddle[currentPlayer].speed,
  }));
}

gameSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.user_name != userName) {
      if (data.player == currentPlayer) {
        currentPlayer ^= 1;
        player[currentPlayer].ready = player[currentPlayer ^ 1].ready;
        player[currentPlayer].user_name = userName;
        player[currentPlayer ^ 1].user_name = data.user_name;
      }
      player[currentPlayer ^ 1].user_name = data.user_name;
      paddle[currentPlayer ^ 1].speed = data.speed;
      player[currentPlayer ^ 1].ready = data.ready;
      if (first) {
        gameSocket.send(JSON.stringify({
          user_name : userName,
          player : currentPlayer,
          ready : player[currentPlayer].ready,
          speed : paddle[currentPlayer].speed,
        }));
        first = false;
      }
    }
    console.log(player[currentPlayer ^ 1].ready, player[currentPlayer].ready, gameOver)
    if (player[currentPlayer ^ 1].ready && player[currentPlayer].ready && gameOver) {
        gameOver = false;
        start();
      }
};

gameSocket.onclose = function(e) {
    console.error('Game socket closed unexpectedly');
};

function start() {
  ball.x = width / 2;
  ball.y = height / 2;
  ball.vx = 5;
  ball.vy = 0;
  move();
}

function collision(obj) {
    let dx = Math.max(obj.x, Math.min(ball.x, obj.x + obj.width)) - ball.x;
    let dy = Math.max(obj.y, Math.min(ball.y, obj.y + obj.height)) - ball.y;
    if (dx * dx + dy * dy > ball.radius * ball.radius)
      return false;
    let collidePoint = ball.y - (obj.y + obj.height / 2)
    collidePoint = collidePoint / (obj.height / 2);
    const angle = collidePoint * Math.PI / 4;
    dir = 1;
    if (obj.x > ball.x)
      dir *= -1;
    ball.vx = Math.cos(angle) * 10 * dir;
    ball.vy = Math.sin(angle) * 10 * dir;
    return true;
}

function move() {
  update();
	if (ball.radius + ball.x > width) {
    player[1].score++;
    ball.vx = -ball.vx;
    changeState();
    player[currentPlayer ^ 1].ready = false;
    document.querySelector('h3').innerHTML = player[currentPlayer].user_name + ': ' + player[currentPlayer].score + ' - ' + player[currentPlayer ^ 1].user_name + ': ' + player[currentPlayer ^ 1].score;
  }
	if (ball.x - ball.radius < 0) {
    player[0].score++;
    ball.vx = -ball.vx;
    changeState();
    player[currentPlayer ^ 1].ready = false;
    document.querySelector('h3').innerHTML = player[currentPlayer].user_name + ': ' + player[currentPlayer].score + ' - ' + player[currentPlayer ^ 1].user_name + ': ' + player[currentPlayer ^ 1].score;
  }
  if (!collision(paddle[currentPlayer]))
    collision(paddle[currentPlayer ^ 1]);
	if (ball.y + ball.radius > height)
		ball.vy = -ball.vy;
	if (ball.y - ball.radius < 0)
		ball.vy = -ball.vy;
	ball.x = ball.x + ball.vx;
	ball.y = ball.y + ball.vy;
  if (paddle[currentPlayer].speed > 0)
    paddle[currentPlayer].y = Math.min(paddle[currentPlayer].y + paddle[currentPlayer].speed, height - paddle[currentPlayer].height);
  else
    paddle[currentPlayer].y = Math.max(paddle[currentPlayer].y + paddle[currentPlayer].speed, 0);
  if (paddle[currentPlayer ^ 1].speed > 0)
    paddle[currentPlayer ^ 1].y = Math.min(paddle[currentPlayer ^ 1].y + paddle[currentPlayer ^ 1].speed, height - paddle[currentPlayer ^ 1].height);
  else
    paddle[currentPlayer ^ 1].y = Math.max(paddle[currentPlayer ^ 1].y + paddle[currentPlayer ^ 1].speed, 0);
  //if (ball.y > paddle[currentPlayer ^ 1].y + paddle[currentPlayer ^ 1].height / 2)
  //  paddle[currentPlayer ^ 1].y = Math.min(paddle[currentPlayer ^ 1].y + paddle[currentPlayer ^ 1].speed, height - paddle[currentPlayer ^ 1].height);
  //else if (ball.y < paddle[currentPlayer ^ 1].y)
  //  paddle[currentPlayer ^ 1].y = Math.max(paddle[currentPlayer ^ 1].y - paddle[currentPlayer ^ 1].speed, 0);
  if (!gameOver && player[currentPlayer].ready && player[currentPlayer ^ 1].ready)
    requestAnimationFrame(move);
}

function update() {
    board.clearRect(0, 0, width, height);
    draw(paddle[currentPlayer]);
    draw(paddle[currentPlayer ^ 1]);
    draw(ball);
}

function draw(coord) {
    board.beginPath();
    if (coord.radius)
      board.arc(coord.x, coord.y, coord.radius, 0, Math.PI * 2);
    else
      board.rect(coord.x, coord.y, coord.width, coord.height);
    board.stroke();
    board.fill();
    board.closePath();
}

document.addEventListener('keydown', start_moving);
document.addEventListener('keyup', stop_moving);

function start_moving(event) {
    if (event.key == 'ArrowDown')
      paddle[currentPlayer].speed = 10;
    else if (event.key == 'ArrowUp')
      paddle[currentPlayer].speed = -10;
    gameSocket.send(JSON.stringify({
        user_name : userName,
        player : currentPlayer,
        ready : player[currentPlayer].ready,
        speed : paddle[currentPlayer].speed,
    }));
}

function stop_moving(event) {
  if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
    paddle[currentPlayer].speed = 0;
    gameSocket.send(JSON.stringify({
        user_name : userName,
        player : currentPlayer,
        ready : player[currentPlayer].ready,
        speed : paddle[currentPlayer].speed,
    }));
  }
}
