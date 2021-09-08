import math
import random

class Paddle:
    def __init__(self, x, y, height, width):
        self.x = x
        self.y = y
        self.speed = 0
        self.width = width
        self.height = height

    def update(self, height):
        if self.speed > 0:
            self.y = min(self.y + 5, height - self.height)
        elif self.speed < 0:
            self.y = max(self.y - 5, 0)

class Player:
    def __init__(self, name):
        self.score = 0
        self.name = name
        self.ready = False

class Ball:
    def __init__(self, x, y):
        self.radius = 10
        self.vx = 5
        if random.random() >= 0.5:
            self.vx *= -1
        self.vy = 0
        self.x = x
        self.y = y

    def update(self, height):
        if self.y + self.vy >= height or self.y + self.vy <= 0:
            self.vy = -self.vy
        self.x += self.vx
        self.y += self.vy


class Game:
    def __init__(self, player1, player2, width, height):
        self.width = width
        self.height = height
        self.player = [{}, {}]
        self.paddle = [{}, {}]
        self.player[0] = Player(player1)
        self.player[1] = Player(player2)
        self.ball = Ball(width / 2, height / 2)
        self.paddle[0] = Paddle(x = 20, y = height / 2 - 50, height = 100, width = 10)
        self.paddle[1] = Paddle(x = width - 30, y = height / 2 - 50, height = 100, width = 10)

    def collision(self, object):
        #collision point
        x = max(object.x, min(self.ball.x, object.x + object.width))
        y = max(object.y, min(self.ball.y, object.y + object.height))
        #distance between collision and center of the ball
        dx = x - self.ball.x
        dy = y - self.ball.y
        #distance between two points formula
        if dx * dx + dy * dy > self.ball.radius * self.ball.radius:
            return
        collidePoint = self.ball.y - (object.y + object.height / 2)
        collidePoint /= (object.height / 2) # relative point
        angle = collidePoint * math.pi / 4
        direction = 1
        if object.x >= self.ball.x:
            direction = -1
        self.ball.vx = math.cos(angle) * 10 * direction
        self.ball.vy = math.sin(angle) * 10 * direction

    def check(self):
        if self.ball.radius + self.ball.x > self.width:
            self.ball = Ball(self.width / 2, self.height / 2)
            self.player[0].score += 1
        if self.ball.x - self.ball.radius < 0:
            self.ball = Ball(self.width / 2, self.height / 2)
            self.player[1].score += 1
        self.collision(self.paddle[0])
        self.collision(self.paddle[1])

    def update(self):
        self.check()
        self.ball.update(self.height)
        self.paddle[0].update(self.height)
        self.paddle[1].update(self.height)
