
$(function() {
	init();
	_war.canvas = document.querySelector('#scene');
	_war.ctx = _war.canvas.getContext('2d');
	intropage();
	bindkeyevent();
	bindImage();
});

function Enemy(x,y,w,h,image) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.image = image;
}

function Ship(x,y,w,h,image) {
	this.x = x;
	this.y = y;
	this.w = h;
	this.h = h;
	this.image = image;
	this.sp = 2; //中间图像
}

function Bullet(x,y,w,h,image) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.image = image;
}

function Explosion(x,y,w,h,image) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.image = image;		
}

//减少全局变量的使用
function init() {
	window._war = {
		canvas:null,
		ctx: null,
		spaceship: null,
		collection: {
			pressdownkeys: [],
			enemies: [],
			bullets: [],
		},
		imgs: {
			bUllets: null,
			EnemyImage: null,
			shipImage: null,
			bgImage: null,
			explOsionImage: null
		}
	};
}

function bindImage() {

  _war.imgs.bgImage = new Image();
	_war.imgs.bgImage.src = './images/levelmap.jpg';
	_war.imgs.bgImage.bgY = 9300;

	_war.imgs.shipImage = new Image();
	_war.imgs.shipImage.src = './images/plane.png';
	
	_war.imgs.EnemyImage = new Image();
	_war.imgs.EnemyImage.src = './images/enemy.png';

	_war.imgs.bUllets = new Image();
	_war.imgs.bUllets.src = './images/rocket.png';

	_war.imgs.explOsionImage = new Image();
	_war.imgs.explOsionImage.src = './images/explosion.png';	
}

function clearCanvas() {
	_war.ctx.clearRect(0, 0, _war.canvas.width, _war.canvas.height);
}

function intropage() {
	clearCanvas();
	var introbg = new Image();
	introbg.src = './images/intro.jpg';
	introbg.onload = function() {
		_war.ctx.drawImage(introbg, 0, 0);
	}
}

function bindkeyevent() {
	$(window).bind('keyup', keyevent);
	$(window).bind('keydown', keyevent1);
}

function keyevent(evt) {
	if(_war.collection.pressdownkeys[evt.keyCode]){
		delete _war.collection.pressdownkeys[evt.keyCode];
	}

	if(evt.keyCode === 13) {
		ispause = false;
		gamepage();
	}

	// A 
	if(evt.keyCode === 65) {
		addBullet();
	}

	//spaceship.sp 图片位置 默认位置
	if(evt.keyCode === 39 || evt.keyCode === 37) {
		if(_war.spaceship.sp > 2) {
			for (var i = _war.spaceship.sp; i >= 2; i--){
				_war.spaceship.sp = i;
			}
		}else if(_war.spaceship.sp < 2) {
			for (i = _war.spaceship.sp; i <= 2; i++){
				_war.spaceship.sp = i;
			}
		}
	}
}

function keyevent1(evt) {
	var pk = _war.collection.pressdownkeys[evt.keyCode];
	if(!pk) {
		_war.collection.pressdownkeys[evt.keyCode] = 1;
	}
}

function gamepage() {
	addEnemy();	
	render();
}

// 添加敌人	
function addEnemy() {
	setInterval(function(){
		createEnemy();
	}, getRange(1000,4000));
}

function createEnemy() {
	var x = getRange(0, _war.canvas.width - _war.imgs.EnemyImage.width);
	_war.collection.enemies.push(new Enemy(x, -_war.imgs.EnemyImage.height, _war.imgs.EnemyImage.width, _war.imgs.EnemyImage.height,_war.imgs.EnemyImage));
}

//获取一个范围(x,y)
function getRange(x,y) {
	return Math.floor(Math.random()*y) + x;
}

function getEnemyHeight(enemy) {
	if(enemy.y < (enemy.h + _war.canvas.height)){
		enemy.y += 4;
	}
	return enemy.y;
}

function getBulletHeight(bullet) {
	if(bullet.y > -bullet.h){
		bullet.y -= 8;
	}else{
		bullet.isdestroy = true;
	}
	return bullet.y;
}

function render() {
	setInterval(function() {
		clearCanvas();
		if(!ispause){
			dobg();	
			processKeydown();
			doenemys();		
			dobulet();
			doShip();
			checkState();
		}
	}, 30);

}

function processKeydown() {
		// right arrow
	if(_war.collection.pressdownkeys[39] !== undefined) {
		if(_war.spaceship.x < 510){
			_war.spaceship.x += 10;
			_war.spaceship.sp = 4;
			_war.ctx.drawImage(_war.spaceship.image, _war.spaceship.sp * 200, 0, 200, 110, _war.spaceship.x, _war.spaceship.y, 200, 110);
		}
	}

	//left arrow 
	if(_war.collection.pressdownkeys[37] !== undefined) {
		if(_war.spaceship.x > -10){
			_war.spaceship.x -= 10;
			_war.spaceship.sp = 0;
			_war.ctx.drawImage(_war.spaceship.image, _war.spaceship.sp * 200, 0, 200, 110, _war.spaceship.x, _war.spaceship.y, 200, 110);
		}
	}
}

//判断子弹、敌机、是否超出界面，如果超出则删除
//判断是否发生爆炸
function checkState() {

		// 敌机飞过，删除
		_war.collection.enemies.forEach(function(item, index) {
			if( !item || item.y > _war.canvas.height){
				_war.collection.enemies.splice(index,1);
			}
		})

		//子弹飞过，删除
		_war.collection.bullets.forEach(function(item, index) {
			if( !item || item.y < -32){
				_war.collection.bullets.splice(index,1);
			}
		})

		//子弹和敌机相遇产生爆炸
		for (var i = 0; i < _war.collection.enemies.length; i++) {
			for (var j = 0; j < _war.collection.bullets.length; j++) {
				if(_war.collection.enemies[i] 
					&&_war.collection.bullets[j].x >= _war.collection.enemies[i].x 
					&& _war.collection.bullets[j].x <= _war.collection.enemies[i].x + _war.collection.enemies[i].w 
					&& (_war.collection.bullets[j].y - _war.collection.enemies[i].y) <= 10) {
					doexplosion(new Explosion(_war.collection.bullets[j].x - 35, _war.collection.bullets[j].y, _war.imgs.explOsionImage.width, _war.imgs.explOsionImage.height, _war.imgs.explOsionImage),0);
					_war.collection.bullets.splice(j,1);
					_war.collection.enemies.splice(i,1);
				}	
			}
		}

		// 敌机和飞船相撞，爆炸
		for (var k = 0; k < _war.collection.enemies.length; k++) {
			var enm = _war.collection.enemies[k],
					sp = _war.spaceship;

			if(enm && (((sp.x >= enm.x && sp.x <= enm.x + enm.w ) 
				|| (sp.x + sp.w >= enm.x && sp.x + sp.w <= enm.x + enm.w ))
				&& (sp.y - enm.y <= 60))) {
				doexplosion(new Explosion(enm.x , enm.y - 30, _war.imgs.explOsionImage.width, _war.imgs.explOsionImage.height, _war.imgs.explOsionImage),0);
					_war.collection.enemies.splice(k,1);
			}
		}

}

function dobg() {
	_war.imgs.bgImage.bgY -= 2;
	if(_war.imgs.bgImage.bgY > 0){
		_war.ctx.drawImage(_war.imgs.bgImage, 0, _war.imgs.bgImage.bgY, 700, 700, 0, 0, 700, 700);
	}else {
		ispause = true;
		alert('game over');
	}
}

// 添加飞船
function doShip() {
	if(!_war.spaceship) {
		_war.spaceship = new Ship(400,580, 100, 110, _war.imgs.shipImage);
	}
	_war.ctx.drawImage(_war.spaceship.image, _war.spaceship.sp * 200, 0, 200, 110, _war.spaceship.x, _war.spaceship.y, 200, 110);
}

function doenemys() {
	_war.collection.enemies.forEach(function(item) {
		if(item) {
			var w = item.w, h = item.h; 
			var y = getEnemyHeight(item);
			_war.ctx.drawImage(item.image, 0, 0, w, h, item.x, y, w, h);	
		}
	});
}

function dobulet() {
	_war.collection.bullets.forEach(function(item) {
		if(item) {
			var y = getBulletHeight(item);
			_war.ctx.drawImage(item.image, 0, 0, item.w, item.h, item.x, y, item.w, item.h);	
		}
	});
} 

function doexplosion(explosion, x) {
		_war.ctx.drawImage(explosion.image, x, 0, 120, 120, explosion.x, explosion.y, 120, 120);
		if(x < 1200){
			x += 120;
			setTimeout(function(){
				doexplosion(explosion,x);
			}, 10);
		}
}

function addBullet() {
	_war.collection.bullets.push(new Bullet(_war.spaceship.x + 85, 580, _war.imgs.bUllets.width, _war.imgs.bUllets.height, _war.imgs.bUllets));	
}