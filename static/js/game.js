const roomName = JSON.parse(document.getElementById('room-name').textContent);
const userName = JSON.parse(document.getElementById('user-name').textContent);
let canvas = document.querySelector('canvas');
let current = 0, gameOver = true;
let height = canvas.height = 700;
let width = canvas.width = 700;
let board = canvas.getContext('2d');
board.strokeStyle = 'white';
board.fillStyle = 'white';

let player = [
{
  'userName' : userName,
  'score' : 0,
  'ready' : false,
  'paddle' : {
    'x' : 20,
    'y' : 350,
    'width': 10,
    'speed' : 0,
    'height' : 100,
  }
},
{
  'userName' : 'Waiting for player...',
  'score' : 0,
  'ready' : false,
  'paddle' : {
    'x' : 700 - 30,
    'y' : 350,
    'width': 10,
    'speed' : 0,
    'height' : 100,
  }
}];

let ball = {
  x : 350,
  y : 350,
  radius : 10,
};


const gameSocket = new WebSocket(
  'ws://'
  + window.location.host + '/'
  + roomName
  + '/'
  + userName
  + '/game/'
);

gameSocket.onclose = function(e) {
  console.error('Game socket closed unexpectedly');
};

function changeState() {
  gameOver = true;
  player[current].ready = !player[current].ready;
  document.querySelector('button').innerHTML = player[current].ready ? "I'm not ready!" : "I'm ready!";
  gameSocket.send(JSON.stringify({
    user_name : userName,
    ready : player[current].ready,
    speed : player[current].paddle.speed,
  }));
}

function updatePlayer(which, data) {
  player[which].ready = data.users[which].ready;
  player[which].score = data.users[which].score;
  player[which].paddle.x = data.users[which].paddle_x;
  player[which].paddle.y = data.users[which].paddle_y;
}

gameSocket.onmessage = function(e) {
  const data = JSON.parse(e.data);
  document.querySelector('h3').innerHTML = data.users[0].user_name + ': ' + data.users[0].score + ' - ' + data.users[1].user_name + ': ' + data.users[1].score;
  if (data.users[current].user_name != userName)
    current = 1;
  updatePlayer(current, data);
  updatePlayer(current ^ 1, data);
  ball.x = data.ball_x;
  ball.y = data.ball_y;
  if (!(player[current].ready && player[current ^ 1].ready))
    gameOver = true
  if (player[current].ready && player[current ^ 1].ready && gameOver) {
    gameOver = false;
    update();
  }
};

function update() {
  board.clearRect(0, 0, width, height);
  draw(player[current].paddle);
  draw(player[current ^ 1].paddle);
  draw(ball);
  gameSocket.send(JSON.stringify({
    user_name : userName,
    ready : player[current].ready,
    speed : player[current].paddle.speed,
  }));
  document.querySelector('button').innerHTML = player[current].ready ? "I'm not ready!" : "I'm ready!";
  if (player[current].ready && player[current ^ 1].ready && !gameOver)
    requestAnimationFrame(update)
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
    player[current].paddle.speed = 1;
  else if (event.key == 'ArrowUp')
    player[current].paddle.speed = -1;
}

function stop_moving(event) {
  if (event.key == 'ArrowUp' || event.key == 'ArrowDown')
    player[current].paddle.speed = 0;
}
