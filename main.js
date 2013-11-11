enchant();
window.onload = function() {
    //--------------------
    //  定数群
    //--------------------
    var GAME_WIDTH  = 320;
    var GAME_HEIGHT = 320;
    var LEFT_WATER_HEIGHT = 3 * GAME_HEIGHT / 4;
    var RIGHT_WATER_HEIGHT = 3 * GAME_HEIGHT / 4 + 40;
    // 水面を y = ax + bの形に落とし込む
    var WATER_LINE_B = LEFT_WATER_HEIGHT;
    var WATER_LINE_A = (RIGHT_WATER_HEIGHT - LEFT_WATER_HEIGHT) / GAME_WIDTH;
    var GRAVITY = 0.4;
    var FPS = 60;
    var DAMAGE_TIME = Math.floor(1 * FPS);
    var GAME_OVER_TIME = Math.floor(1 * FPS);
    var LIFE_NUM = 5;

    //--------------------
    //  game 作成
    //--------------------
    var game = new Game();
    game.fps = FPS;
    game.keybind(32, "a");
    game.preload(
        "img/chara.png",
        "img/rock.png",
        "img/life.png",
        "img/game_over.png",
        "img/back1.png",
        "img/back2.png",
        "img/back3.png"
        );//画像
    game.rootScene.backgroundColor = "#a2d39a";
    game.rock_counter = 0;
    game.finished = false;

    var flg = false;
    //岩の生成が主な役割
    game.update = function(){
        if(this.rock_counter <= 0){
            new Rock();
            this.rock_counter = Math.floor(Math.random() * FPS * 2);
            if((this.rock_counter > 20 && this.rock_counter < 30)){
                this.rock_counter = 20;
            } else if(this.rock_counter < 42){
                this.rock_counter = 42;
            }
        }
        this.rock_counter--;
        back.update();
    };
    game.addEventListener("enterframe", game.update);

    var boat;
    var river;
    var life;
    var score;
    var back;

    //--------------------
    //  クラス定義
    //--------------------
    var Boat = enchant.Class.create(enchant.Sprite,{
        initialize: function(){
            enchant.Sprite.call(this, 40, 40);
            this.image = game.assets["img/chara.png"];
            this.age = 0;
            this.x = GAME_WIDTH / 8;
            this.y = 0;
            this.vy = 0;
            this.float_height = this.height - this.height * 0.4;
            this.on_water = false;
            this.game_over_counter = 0;

            this.addEventListener("enterframe", this.update);
            game.rootScene.addChild(this);
            //当たり判定の実装
            this.damage_counter = 0;
            this.hitbody = new Sprite(30, 15);
            this.hitbody.paddingLeft = 5;
            this.hitbody.paddingTop = 10;
            // this.hitbody.backgroundColor = "rgba(0, 100, 0, 0.5)";
            game.rootScene.addChild(this.hitbody);

        },
        update: function(){
            if(this.game_over_counter){
                this.updateAsGameOver();
                return;
            }
            //入力処理
            if(game.input.left) {
                this.x -= 1;
            }
            if(game.input.right){
                this.x += 1;
            }
            if(game.input.right && game.input.left && this.on_water){
                this.y = this.x * WATER_LINE_A + WATER_LINE_B - this.float_height;
            }
            //水面に居るとき
            if(this.on_water){ //自由落下してない
                if(game.input.a || game.input.up) this.vy = -8;
                this.on_water = false;
            }
            // 空中に居るとき
            if(!this.on_water){
                this.vy += GRAVITY;
                this.y += this.vy;
                // 上昇時
                if(this.vy < 0){
                    if(!game.input.a && !game.input.up) this.vy = 0;
                }
                // 下降時
                else {
                    // 着水判定
                    if(this.y + this.float_height> this.x * WATER_LINE_A + WATER_LINE_B){
                        this.y = this.x * WATER_LINE_A + WATER_LINE_B - this.float_height;
                        this.vy = 0;
                        this.on_water = true;
                    }
                }
            }
            this.frame = [0, 1, 0, 2][Math.floor(this.age / 9) % 4];
            //ダメージを受けた場合の見た目処理
            if(this.damage_counter){
                if(Math.floor(this.damage_counter) % 2){
                    this.frame = 3;
                }
                this.damage_counter--;
            }
            this.age++;
            // =============
            //   当たり判定
            // =============
            this.hitbody.x = this.x + this.hitbody.paddingLeft;
            this.hitbody.y = this.y + this.hitbody.paddingTop;
        },
        damage: function(){
            this.damage_counter = DAMAGE_TIME;
            life.damage();
        },
        gameOver: function(){
            this.scaleY = -1;
            this.game_over_counter = GAME_OVER_TIME;
            this.vy = -8;
            game.finished = true;
        },
        updateAsGameOver: function(){
            this.y += this.vy;
            this.vy += GRAVITY;
            if(this.game_over_counter % 2){
                this.frame = 3;
            } else {
                this.frame = 1;
            }
            this.game_over_counter--;
            if(this.game_over_counter == 0){
                this.removeEventListener("enterframe", this.update);
                var label = new Sprite(320, 100);
                label.image = game.assets["img/game_over.png"];
                label.y = GAME_HEIGHT / 4;
                game.rootScene.addChild(label);
            }
        },
    });

    //川
    var River = enchant.Class.create(enchant.Sprite,{
        initialize: function(){
            enchant.Sprite.call(this, GAME_WIDTH, GAME_HEIGHT);
            // this.backgroundColor = "blue";
            this.addEventListener("enterframe", this.update);
            game.rootScene.addChild(this);
            var s = new Surface(GAME_WIDTH, GAME_HEIGHT);
            this.image = s;
            this.context = s.context;
            this.draw();
            // this.addEventListener("enterframe", this.update);
            game.rootScene.addChild(this);
        },
        update: function(){
        },
        draw: function(){
            this.context.fillStyle = 'rgb(110, 110, 255)';
            this.context.beginPath();
            this.context.moveTo(0, LEFT_WATER_HEIGHT);
            this.context.lineTo(GAME_WIDTH, RIGHT_WATER_HEIGHT);
            this.context.lineTo(GAME_WIDTH, GAME_HEIGHT);
            this.context.lineTo(0, GAME_HEIGHT);
            this.context.closePath();
            this.context.fill();
            // this.context.fillRect(10, 10, GAME_WIDTH - 20, GAME_HEIGHT - 20);
        }
    });

    // 岩
    var Rock = enchant.Class.create(enchant.Sprite, {
        initialize: function(){
            enchant.Sprite.call(this, 40, 40);
            this.image = game.assets["img/rock.png"],

            this.float_height = this.height - this.height / 3;
            this.x = GAME_WIDTH + this.width;
            this.y = this.x * WATER_LINE_A + WATER_LINE_B - this.float_height;
            this.vx = 2;

            this.over = false;

            game.rootScene.insertBefore(this, river);

            //当たり判定の実装
            this.hitbody = new Sprite(24, 30);
            this.hitbody.x = this.x;
            this.hitbody.y = this.y;
            this.hitbody.paddingLeft = 7;
            this.hitbody.paddingTop = 10;
            // this.hitbody.backgroundColor = "rgba(0, 100, 0, 0.5)";
            game.rootScene.addChild(this.hitbody);

            this.addEventListener("enterframe", this.update);
        },
        update: function(){
            this.x -= this.vx;
            this.y = this.x * WATER_LINE_A + WATER_LINE_B - this.float_height;
            // console.log("("+this.x + ", "+ this.y+")");
            if (this. x < - this.width){
                this.remove();
            }
            // =============
            //   当たり判定
            // =============
            if(game.finished) return;

            this.hitbody.x = this.x + this.hitbody.paddingLeft;
            this.hitbody.y = this.y + this.hitbody.paddingTop;

            if(this.hitbody.intersect(boat.hitbody)){
                if(!boat.damage_counter){
                    boat.damage();
                    this.over = true;
                }
            }
            //飛び越えたら得点
            if(!this.over){
                if(boat.x > this.x){
                    score.gain();
                    this.over = true;
                }
            }
        },
        remove: function(){
            this.removeEventListener("enterframe", this.update);
            game.rootScene.removeChild(this);
        },
    });

    var Life = function(){
        this.gauge = new Array();
        for (var i = 0; i < LIFE_NUM; i++){
            var l = new Sprite(15, 15);
            l.image = game.assets["img/life.png"];
            l.x = 2;
            l.y = 2 + i * 17;
            game.rootScene.addChild(l);
            this.gauge.push(l);
        }
        this.life = LIFE_NUM;
    };

    Life.prototype.damage = function(){
        this.life--;
        this.gauge[this.life].frame = 1;
        if(this.life == 0){
            boat.gameOver();
        }
    };

    var Score = enchant.Class.create(enchant.Label, {
        initialize: function(){
            enchant.Label.call(this, "score : 0");
            this.num = 0;
            this.x = GAME_WIDTH - 90;
            this.y = 10;
            game.rootScene.addChild(this);
        },
        gain: function(){
            this.num++;
            this.text = "score : " + this.num;
        }
    });

    var Back = enchant.Class.create(enchant.Sprite, {
        initialize: function(){
            enchant.Sprite.call(this, 320, 640);
            this.imgs = new Array();
            for (var i = 1; i <= 3; i++){
                var imgR = new Sprite(640, 320);
                var imgL = new Sprite(640, 320);
                imgR.image = game.assets["img/back"+i+".png"];
                imgL.image = game.assets["img/back"+i+".png"];
                imgL.x = 640;
                imgL.frame = 1;
                this.imgs.push([imgR, imgL]);
                game.rootScene.addChild(imgR);
                game.rootScene.addChild(imgL);
            }
            // this.addEventListener("enterframe", this.update);
            console.log(this.update);
        },
        update: function(){
            console.log("hoge");
            for (var i = 0; i < 3; i++){
                var imgR = this.imgs[i][0];
                var imgL = this.imgs[i][1];
                imgR.x -= [0.25,0.5,1][i];
                imgL.x -= [0.25,0.5,1][i];
                if(imgR.x < -640) imgR.x += 1280;
                if(imgL.x < -640) imgL.x += 1280;
            }
        },
    });


    game.onload = function() {
        back = new Back();
        boat = new Boat();
        river = new River();
        life = new Life();
        score = new Score();
        //スマホ対応
        game.rootScene.addEventListener('touchstart', function(e) {
            if(e.y < GAME_HEIGHT / 2) game.input.up = true;
            if(e.x < GAME_WIDTH / 2) game.input.left = true;
            else game.input.right = true;
        });
        game.rootScene.addEventListener('touchend', function(e) {
            game.input.up = false;
            game.input.left = false;
            game.input.right = false;
        });
    };
    game.start();
};


function rand(num){ return Math.floor(Math.random() * num) };
