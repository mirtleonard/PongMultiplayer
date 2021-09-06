import math

class Peddle:
    def __init__(self, x, y, height, width):
        self.x = x
        self.y = y
        self.speed = 0
        self.width = width
        self.height = height

    def update(self, height):
        if self.speed > 0:
            self.x = min(self.x + speed, height - self.height)
        else:
            self.x = max(self.x + speed, 0)

class Player:
    def __init__(self, name):
        self.name = 0
        self.score = 0
        self.ready = False

class Ball:
    def __init__(self, x, y):
        self.radius = 10
        self.vx = 5
        self.vy = 0
        self.x = x
        self.y = y

    def update(self):
        if self.y + self.vy >= height or self.y + self.vy <= 0:
            self.vy = -self.vy
        self.x += self.vx
        slef.y += self.vy


class Game:
    def __init__(self, player1, player2, width, height):
        self.width = width
        self.height = height
        self.player1 = Player(player1)
        self.player2 = Player(player2)
        self.ball = Ball(width / 2, height / 2)
        self.peddle1 = Peddle(0, x = 20, y = height / 2, height = 100, width = 10)
        self.peddle2 = Peddle(0, x = width - 30, y = height / 2, height = 100, width = 10)

    def collision(self, object):
        #collision point
        x = max(obj.x, min(self.ball.x, obj.x + obj.width))
        y = max(obj.y, min(self.ball.y, obj.y + obj.width))
        #distance between collision and center of the ball
        dx = x - ball.x
        dy = y - ball.y
        #distance between two points formula
        if dx * dx + dy * dy > ball.radius * ball.radius:
            return
        collidePoint = ball.y - (obj.y + obj.height / 2)
        collidePoint /= (obj.height / 2) # relative point
        angle = collidePoint * math.pi / 4
        direction = 1
        if obj.x >= ball.x:
            direction = -1
        self.ball.vx = math.cos(angle) * 10 * dir;
        self.ball.vy = math.sin(angle) * 10 * dir;

    def check(self):
        if self.ball.radius + self.ball.x > self.width:
            self.player1.score += 1
            self.game_over()
        if self.ball.x - self.ball.radiius < 0:
            self.palyer2.score += 1
            self.game_over()
        collision(self, self.paddle1)
        collision(self, self.paddle2)


    def game_over():
        self.player1.ready = False
        self.player2.ready = False
        self.ball = Ball(self.width / 2, self.height / 2)

    def update(self):
        self.check()
        self.ball.update()
        self.paddle1.update(height)
        self.paddle2.update(height)
