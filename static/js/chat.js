const chatSocket = new WebSocket(
  'ws://'
  + window.location.host + '/'
  + roomName
  + '/'
  + userName
  + '/chat/'
)

chatSocket.onmessage = function(e) {
  const data = JSON.parse(e.data);
  document.querySelector('#chat-log').value += (data.user_name + ': ' + data.message + '\n');
};

document.querySelector('#chat-message-input').onkeyup = function(e) {
  if (e.keyCode === 13) {  // enter, return
    document.querySelector('#chat-message-submit').click();
  }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
  const messageInputDom = document.querySelector('#chat-message-input');
  chatSocket.send(JSON.stringify({
    'message': messageInputDom.value
  }));
  messageInputDom.value = '';
};

chatSocket.onclose = function(e) {
  console.error('Game socket closed unexpectedly');
};
