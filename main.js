let assets = [
    "images/alienArmada.json",
    "sounds/explosion.mp3",
    "sounds/music.mp3",
    "sounds/shoot.mp3",
    "fonts/emulogic.ttf"
];

let game = hexi(480, 320, setup, assets, load);

game.fps = 60;
game.border = "1px black dashed";

let gameScene, endScene, player, score, gameover, aliens, bullets, scoreDisplay, message, shootSound,
    explosionSound, musicSound, alienFrequency, alienTimer;

function play () {

    alienTimer++;

    if(alienTimer === alienFrequency) {

        let alienFrames = [
            "alien.png",
            "explosion.png"
        ];

        let alien = game.sprite(alienFrames);

        alien.states = {
            normal: 0,
            destroyed: 1
        };

        alien.y = 0 - alien.height;

        alien.x = game.randomInt(0, 14) * alien.width;

        alien.vy = 1;

        aliens.push(alien);

        alien.show(alien.states.normal);
        gameScene.addChild(alien);

        alienTimer = 0;

        if(alienFrequency > 20) {

            alienFrequency--;

        }

    }

    game.contain(player, game.stage);
    game.move(player);

    bullets = bullets.filter(bullet => {

        let bulletHitEdges = game.contain(
            bullet,
            {
                x: 0, y: - 32,
                width: game.stage.width,
                height: game.stage.height + 32
            });

        if (bulletHitEdges && bulletHitEdges.has("top")) {

            game.remove(bullet);

            return false;

        } else {

            game.move(bullet);

            return true;
        }

    });

    aliens.forEach(alien => {

        let alienHitEdges = game.contain(
            alien,
            {
                x: 0, y: - 32,
                width: game.stage.width,
                height: game.stage.height - 32
            });

        if (alienHitEdges && alienHitEdges.has("bottom")) {

            gameover = true;

            return false;

        } else {

            game.move(alien);

            return true;
        }

    });

    aliens = aliens.filter(alien => {

        let alienIsAlive = true;

        bullets = bullets.filter(bullet => {

            if (game.hitTestRectangle(alien, bullet)) {

                game.remove(bullet);

                alien.show(alien.states.destroyed);

                explosionSound.play();

                alien.vy = 0;

                alienIsAlive = false;

                game.wait(1000, () => game.remove(alien));

                score += 1;

                return false;

            } else {

                return true;

            }

        });

        return alienIsAlive;

    });

    scoreDisplay.content = score;

    if (gameover) {

        game.state = end;

    }

}

function end () {

    message.content = "YOU LOSE";
    message.visible = true;

    game.pause();

}

function setup () {

    alienFrequency = 100;
    alienTimer = 0;
    score = 0;
    gameover = false;

    shootSound = game.sound("sounds/shoot.mp3");
    explosionSound = game.sound("sounds/explosion.mp3");
    musicSound = game.sound("sounds/music.mp3");
    musicSound.loop = true;

    message = game.text("", "20px emulogic", "#00FF00");
    message.visible = false;
    message.pivotX = 0.5;
    message.pivotY = 0.5;
    game.stage.putCenter(message);
    scoreDisplay = game.text(score, "20px emulogic", "#00FF00", 400, 10);

    player = game.sprite("cannon.png");

    game.stage.putBottom(player, 0, - (player.height + 5));

    let rightArrow = game.keyboard(39),
        leftArrow = game.keyboard(37);

    rightArrow.press = () => {
        player.vx = 5;
        player.vy = 0;
    };
    rightArrow.release = () => {
        if (!leftArrow.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };

    leftArrow.press = () => {
        player.vx = -5;
        player.vy = 0;
    };
    leftArrow.release = () => {
        if (!rightArrow.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };

    bullets = [];

    game.keyboard(32).press = () => {
        if (!musicSound.playing) musicSound.play();

        if (game.state === play) {

            //Shoot the bullet
            game.shoot(
                player,            //The shooter
                4.71,              //The angle at which to shoot (4.71 is up)
                player.halfWidth,  //Bullet's x position on the cannon
                0,                 //Bullet's y position on the canon
                game.stage,           //The container to which the bullet should be added
                7,                 //The bullet's speed (pixels per frame)
                bullets,           //The array used to store the bullets

                //A function that returns the sprite that should
                //be used to make each bullet
                () => game.sprite("bullet.png")
            );

            //Play the shoot sound.
            shootSound.play();

        }
    };

    aliens = [];

    gameScene = game.group(game.sprite("background.png"), scoreDisplay, player, message);

    game.keyboard(13).press = () => {

        if (game.state === end) {

            reset();

        }

    };

    game.state = play;
}

function reset ()  {

    game.stage.putBottom(player, 0, - (player.height + 5));
    message.visible = false;
    game.remove(aliens);
    game.remove(bullets);
    score = 0;
    scoreDisplay.content = score;
    alienFrequency = 100;
    alienTimer = 0;
    gameover = false;

    game.state = play;

    game.resume();
}

function load () {

    game.loadingBar();

}

game.start();