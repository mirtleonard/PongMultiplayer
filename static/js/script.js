const roomName = JSON.parse(document.getElementById('room-name').textContent);
const userName = JSON.parse(document.getElementById('user-name').textContent);

let player = 1;

function changePlayer() {
  if (player)
    player = 0;
  else
    player = 1;
}

const gameSocket = new WebSocket(
    'ws://'
    + window.location.host + '/'
    + roomName
    + '/'
    + userName
    + '/game/'
);

gameSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.user_name != userName)
      paddle[player ^ 1].speed = data.speed;
};

gameSocket.onclose = function(e) {
    console.error('Game socket closed unexpectedly');
};


let canvas = document.querySelector('canvas');
let width = canvas.width = 700;
let height = canvas.height = 700;
let board = canvas.getContext('2d');
board.strokeStyle = 'white';
board.fillStyle = 'white';
let gameOver = false;
//let player = [{}, {}];
let paddle = [{},{}];
let score = [0, 0];


paddle[player] = {
  x : width - 30,
  y : height / 2 - 100,
  height : 100,
  width : 10,
  speed : 0,
}

paddle[player ^ 1] = {
  x : 20,
  y : height / 2 - 100,
  height: 100,
  speed: 10,
  width: 10,
}

let ball = {
  x : width / 2,
  y : height / 2,
  radius : 10,
  vx : 5,
  vy : 5,
}

start();

function start() {
  ball.x = width / 2;
  ball.y = height / 2;
  ball.vx = 5;
  ball.vy = 0;
  gameOver = false;
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
    score[player]++;
    //gameOver = true;
    ball.vx = -ball.vx;
    document.querySelector('h3').innerHTML = 'Score ' + score[player] + ' - ' + score[player ^ 1];
  }
	if (ball.x - ball.radius < 0) {
    score[player ^ 1]++;
    ball.vx = -ball.vx;
    //gameOver = true;
    document.querySelector('h3').innerHTML = 'Score ' + score[player] + ' - ' + score[player ^ 1];
  }
  if (!collision(paddle[player]))
    collision(paddle[player ^ 1]);
	if (ball.y + ball.radius > height)
		ball.vy = -ball.vy;
	if (ball.y - ball.radius < 0)
		ball.vy = -ball.vy;
	ball.x = ball.x + ball.vx;
	ball.y = ball.y + ball.vy;
  if (paddle[player].speed > 0)
    paddle[player].y = Math.min(paddle[player].y + paddle[player].speed, height - paddle[player].height);
  else
    paddle[player].y = Math.max(paddle[player].y + paddle[player].speed, 0);
  console.log(paddle[player ^ 1].speed);
  if (paddle[player ^ 1].speed > 0)
    paddle[player ^ 1].y = Math.min(paddle[player ^ 1].y + paddle[player ^ 1].speed, height - paddle[player ^ 1].height);
  else
    paddle[player ^ 1].y = Math.max(paddle[player ^ 1].y + paddle[player ^ 1].speed, 0);
  //if (ball.y > paddle[player ^ 1].y + paddle[player ^ 1].height / 2)
  //  paddle[player ^ 1].y = Math.min(paddle[player ^ 1].y + paddle[player ^ 1].speed, height - paddle[player ^ 1].height);
  //else if (ball.y < paddle[player ^ 1].y)
  //  paddle[player ^ 1].y = Math.max(paddle[player ^ 1].y - paddle[player ^ 1].speed, 0);
  if (!gameOver)
    requestAnimationFrame(move);
}

function update() {
    board.clearRect(0, 0, width, height);
    draw(paddle[player]);
    draw(paddle[player ^ 1]);
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
      paddle[player].speed = 10;
    else if (event.key == 'ArrowUp')
      paddle[player].speed = -10;
    gameSocket.send(JSON.stringify({
        user_name : userName,
        speed : paddle[player].speed
    }));

    if (gameOver)
      start();
}

function stop_moving(event) {
  if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
    paddle[player].speed = 0;
    gameSocket.send(JSON.stringify({
        speed : paddle[player].speed,
        user_name : userName,
    }));
  }
}
