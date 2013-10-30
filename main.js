enchant();
window.onload = function() {
    //--------------------
    //  定数群
    //--------------------
    var GAME_WIDTH  = 320;
    var GAME_HEIGHT = 320;
    var LEFT_WATER_HEIGHT = GAME_HEIGHT / 2;
    var RIGHT_WATER_HEIGHT = GAME_HEIGHT / 2 + 40;
    // 水面を y = ax + bの形に落とし込む
    var WATER_LINE_B = LEFT_WATER_HEIGHT;
    var WATER_LINE_A = (RIGHT_WATER_HEIGHT - LEFT_WATER_HEIGHT) / GAME_WIDTH;
    var GRAVITY = 0.6;

    //--------------------
    //  game 作成
    //--------------------
    var game = new Game();
    game.fps = 60;
    game.keybind(32, "a");

    //--------------------
    //  クラス定義
    //--------------------
    var Boat = enchant.Class.create(enchant.Sprite,{
        initialize: function(){
            enchant.Sprite.call(this, 40, 40);
            this.backgroundColor = "green";
            this.x = 0;
            this.y = 0;
            this.vy = 0;
            this.float_height = this.height - this.height / 3;
            this.prev_vy = 0;
            this.on_water = false;
            this.addEventListener("enterframe", this.update);
            game.rootScene.addChild(this);
        },
        update: function(){
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
                if(game.input.a || game.input.up) this.vy = -12;
                this.on_water = false;
            }
            // 空中に居るとき
            if(!this.on_water){
                this.vy += GRAVITY;
                this.y += this.vy;
                // 上昇時
                if(this.vy < 0){
                    if(!game.input.a) this.vy = 0;
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
            this.backgroundColor = "red";
            this.float_height = this.height - this.height / 3;
            this.x = GAME_WIDTH + this.width;
            this.y = this.x * WATER_LINE_A + WATER_LINE_B - this.float_height;
            this.vx = 2;
            this.on_water = false;
            this.addEventListener("enterframe", this.update);
            game.rootScene.addChild(this);
        },
        update: function(){
            this.x -= this.vx;
            this.y = this.x * WATER_LINE_A + WATER_LINE_B - this.float_height;
            // todo
            console.log("("+this.x + ", "+ this.y+")");
            if (this. x < 0){
                delete this;
            }
        },
    });
    game.onload = function() {
        var boat = new Boat();
        var rock = new Rock();
        var river = new River();
    };
    game.start();
};


function rand(num){ return Math.floor(Math.random() * num) };
