var myChessColor; // 我的棋子的颜色
var chessLevel;
// onclick的响应里，落子全部进行好以后，调用智能算法，分区域分阶段遍历棋盘

var counterPartColor;

var board; 
var directionSeq; // 鼠标位置的各方状况
var now_show_focus; // 鼠标移动到的位置有没有可以吃的		
var dir; //方向增量表
var uId;
var CounterPartId;
var ContestStatus; 

// 优先坐标集合表
var VSet;

var settingShow=false;
var helpShow=false;
var lastStep="none"; // 最后一步棋

// 两方的棋子个数
var blackNum = 2;
var whiteNum = 2;


// 每个Cell作为一个方向上的元素
function SeqCell()
{
	// Set the initial state for this cell
	this.x = 0;
	this.y = 0;
	this.color = 1;
	this.num = 0; // 如果可以置换，记录在那个方向上要置换的个数， 
}

function dirCell()
{
	this.dx = 0;
	this.dy = 0;
}

// onload
function board_create()
{
	var i;
	var j;
	
	board = new Array(8);
	for(i=0; i<8; i=i+1)
	{
		board[i] = new Array(8);
	}
	
	dir = new Array(8);
	for(i=0; i<8; i=i+1)
	{
		dir[i] = new dirCell();	
	}
	dir[0].dx=-1; dir[0].dy=0; 
	dir[1].dx=-1; dir[1].dy=1;
	 
	dir[2].dx=0; dir[2].dy=1; 
	dir[3].dx=1; dir[3].dy=1;
	
	dir[4].dx=1; dir[4].dy=0; 
	dir[5].dx=1; dir[5].dy=-1;
	 
	dir[6].dx=0; dir[6].dy=-1; 
	dir[7].dx=-1; dir[7].dy=-1;		
	
	//八个方向的编号：0-up,1-upright,2-right,3-rightdown,4-down,5-leftdown,6-left,7-leftup
	directionSeq = new Array(8);
	for(i=0; i<8; i=i+1)
	{
		directionSeq[i] = new SeqCell();
	}
	
	VSet = [0,0,0,7,7,0,7,7,
	0,2,0,3,0,4,0,5,7,2,7,3,7,4,7,5,2,0,3,0,4,0,5,0,2,7,3,7,4,7,5,7,
	1,2,1,3,1,4,1,5,6,2,6,3,6,4,6,5,2,1,3,1,4,1,5,1,2,6,3,6,4,6,5,6,
	0,1,0,6,1,0,1,1,1,6,1,7,6,0,6,1,6,6,6,7,7,1,7,6]; // 4*2,16*2,16*2,12*2

	myChessColor = 1; // 默认为黑子，先手
	chessLevel = "common"; // 默认为普通级别
}

// 根据当前自己和对方的棋子个数，改变某个单元的数量显示
// 在div里显示现在双方的战况
function freshChessNum()
{
	document.getElementById("bNum").innerHTML=blackNum.toString();
	document.getElementById("wNum").innerHTML=whiteNum.toString();
	
	if((blackNum+whiteNum)==64)
	{
		if(myChessColor==1 && blackNum>whiteNum)
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","IWon");
			document.getElementById("result").innerHTML = "持黑子:赢了";
		}
		else if(myChessColor==2 && whiteNum>blackNum)
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","IWon");
			document.getElementById("result").innerHTML = "持白子:赢了";			
		}
		else if(whiteNum==blackNum)
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","Equal");
			document.getElementById("result").innerHTML = "平手";
		}
		else
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","GameOver");
			document.getElementById("result").innerHTML = "对手赢了";
		}			
		document.getElementById("passimg").style.display="block";
	}
}

/**
添加一个棋子图片 或者 将带点的棋子更换成不带点的，添加图片的同时，
就可以处理周围图片的变化，同时要改变本文件维护的数组
*/
function changeChess(chess,pre)
{
	if(chess.indexOf("-")==-1)
	{
		return;
	}
	var temp = chess.split("-");
	var num = parseInt(temp[0])*8+parseInt(temp[1]);                 //以前就是此处也是反的
	if(temp[2]==1)
	{
		document.getElementById("ID"+num).innerHTML="<img src=\"image/black"+pre+".gif\" width=\"32\" height=\"32\" border=\"0\" />";
	}else
	{
		document.getElementById("ID"+num).innerHTML="<img src=\"image/white"+pre+".gif\" width=\"32\" height=\"32\" border=\"0\" />";
	}
}

/*
下一颗棋子
*/
function putAchess(x,y,chess)
{
	var chessStr=x+"-"+y+"-"+chess; // 现在棋子的位置，连同登陆读到的room编号，用来告诉服务器这次下棋的信息
	if(lastStep!="none") // 如果能换子，下面的操作才有必要进行
	{
		//找到上一个位置,把焦点转换走,update
		var temp = lastStep.split("-");
		var x1 = parseInt(temp[0]);
		var y1 = parseInt(temp[1]);
		if(temp[2]==board[x1][y1]) //如果没有被吃掉，没有改变棋子图象
		{
			changeChess(lastStep,""); //才可以在原来的图象基础上换一点，否则就白吃了，在棋盘上又恢复了
		}
	}
	lastStep=chessStr;
}


//board 和 myChessColor，这都是公用的
//计算当前提供的坐标在某个方向上可吃对方子的个数，如果有子可吃，就变更棋盘，同时改变网页
function eat(x,y,dx,dy,theChessColor)
{
	var posNum = 0;
	var negNum = 0;
	var curX;
	var curY;
	var eatChess;
	var myPic;
	if (theChessColor==1)
	{
		myPic = "black.gif";
		eatChess = 2;
	}
	else if (theChessColor==2)
	{
		myPic = "white.gif";
		eatChess = 1;
	}
	// 处理正方向上的吃子
	curX = x+dx;
	curY = y+dy;
	while (curX<8&&curY<8&&curX>=0&&curY>=0 && board[curX][curY]==eatChess)
	{
		posNum=posNum+1;
		curX = curX+dx;
		curY = curY+dy;
	}	
	// 如果越界或找不到自己的子，那么就不可以吃对方的子
	if (!(curX<8&&curY<8&&curX>=0&&curY>=0)||board[curX][curY]==0)
	{
		posNum = 0;
	}
	if (posNum>0)
	{
		//吃子和处理棋盘的显示
		curX = x+dx;
		curY = y+dy;
		for (var i=1; i<=posNum; i=i+1)
		{
			board[curX][curY] = theChessColor;  //棋盘保存好了
			//改变网页
			num = curX*8+curY;
			document.getElementById("ID"+num).innerHTML="<img src=\"image/"+myPic+"\" width=\"32\" height=\"32\" border=\"0\"/>";
			curX = curX+dx;
			curY = curY+dy;
		}
	}
	// 处理负方向上的吃子
	curX = x-dx;
	curY = y-dy;
	while (curX<8&&curY<8&&curX>=0&&curY>=0 && board[curX][curY]==eatChess)
	{
		negNum=negNum+1;
		curX = curX-dx;
		curY = curY-dy;
	}
	if (!(curX<8&&curY<8&&curX>=0&&curY>=0)||board[curX][curY]==0)
	{
		negNum = 0;
	}
	if (negNum>0)
	{
		//吃子和处理棋盘的显示
		curX = x-dx;
		curY = y-dy;
		for (var j=1; j<=negNum; j=j+1)
		{
			board[curX][curY] = theChessColor;  //棋盘保存好了
			//改变网页
			num = curX*8+curY;
			document.getElementById("ID"+num).innerHTML="<img src=\"image/"+myPic+"\" width=\"32\" height=\"32\" border=\"0\" />";
			curX = curX-dx;
			curY = curY-dy;
		}
	}
	return posNum+negNum;
}

/**
根据这个位置和落子的颜色，检查各个方向检查落子的可能
最后一个参数作为标志，区分：预留判断、或者点击有吃就改变逻辑和棋盘
*/
function check_it(x,y,theChessColor,down)
{
	//八个方向的编号：0-up,1-upright,2-right,3-rightdown,4-down,5-leftdown,6-left,7-leftup
	//1. 周围至少有异色， 2. 至少有某个方向可以吃，
	//仍然最多找8个方向，一圈一圈地在附近搜索，上次的搜索限定下次搜索的范围
	
	//下次搜索次数的变化，需要借助上次结果的存储
	//t一下，开始看异色，结束看同色，有一个方向结束就可以停止其他搜索，返回可吃的标志
	//没有开始就结束、或有开始的都没有结束，返回没有可吃的标志
	var i,j;
	var target_color;
	var thePic;
	var nX,nY;
	var pos_num;
	var dAll = 0;
	//var show_focus = false;

	if(board[x][y]!=0)
	{
		return dAll;	
	}
	
	if(theChessColor==1)
	{
		thePic = "black";
		target_color = 2;	
	}
	else
	{
		thePic = "white";
		target_color = 1;	
	}
	
	for(i=0; i<8; i=i+1)
	{
		nX = x + dir[i].dx;
		nY = y + dir[i].dy;
		
		directionSeq[i].num = 0;
		directionSeq[i].x = x;
		directionSeq[i].y = y;
		directionSeq[i].color = theChessColor;
				
		while(nX>=0 && nX<8 && nY>=0 && nY<8 && board[nX][nY]==target_color)	
		{
			nX += dir[i].dx;
			nY += dir[i].dy;
			directionSeq[i].num += 1; 
		}
	
		if(!(nX>=0 && nX<8 && nY>=0 && nY<8))
		{
			// 标志设置为不可吃，提前继续下一个方向
			directionSeq[i].num = 0;
			continue;
			// 到了边界以外，也没有发现同色，不能做下面的判断
		}
		// 其间有异色的情况，标志设置为可吃，保持记载i方向现在可以置换的个数
		// 其间没有异色，标志设置为不可吃，用可吃的个数为0表示	
// 以下为吃子的唯一可能条件		
		if(board[nX][nY]==theChessColor && (directionSeq[i].num)>0)
		{
			// show_focus = true; // 只要在一个地方有不等于0的情况，就有的吃
			// 如果有落子的动作，或者在自动算法里已经到了落子的时机
			dAll += (directionSeq[i].num);
			if(down==true)
			{
				for(j=0; j<directionSeq[i].num; j=j+1)
				{
					nX -= dir[i].dx;
					nY -= dir[i].dy;	
								
					// 找到方向、个数之后，改变逻辑和界面的棋盘局面
					pos_num = nX*8+nY;								
					board[nX][nY] = theChessColor;
					document.getElementById("ID"+pos_num).innerHTML="<img src=\"image/"+thePic+".gif\" width=\"32\" height=\"32\" border=\"0\" />";		
				}				
			}
		}
		else if(board[nX][nY]!=theChessColor && (directionSeq[i].num)>0)
		{
			directionSeq[i].num = 0;// 在这个方向上不止一个异色的棋，直到遇见棋盘空白	
		}
	}

	if(down==true && dAll>0)
	{
		//下一颗棋子								
		board[x][y] = theChessColor;
		putAchess(x,y,theChessColor);
		pos_num = x*8+y;	
		document.getElementById("ID"+pos_num).innerHTML="<img src=\"image/"+thePic+"2.gif\" width=\"32\" height=\"32\" border=\"0\" />";
	}

	return dAll;
}

/**
普通级别的机器策略
改变棋盘、逻辑数组，整合到一起，如果没有地方落子，需要返回一个状态
*/
function common_check(theChessColor,down)
{
	var i,j;
	var mention_str;
	var dAll = 0;

	// 区域权重排序
	// eval出循环语句
	//（目前）最优落子区域

	// 一遍搜素需要归类表作为辅助，划分区域，如果事前找到可下棋的位置，
	// 这个位置的记录就要保留：到更优的区域有棋可下（或者说更优区域仍没有搜索完）为止；在更优的区域递推直到最优区域
	// 高优先的区域没有，就逐步选择低优先的区域
	for(i=0; (i<8 && dAll==0); i=i+2)
	{
		dAll = check_it(VSet[i],VSet[i+1],theChessColor,down);	
	}
	
	for(i=2; (i<=5 && dAll==0); i=i+1)
	{
		for(j=2; (j<=5 && dAll==0); j=j+1)
		{
			dAll = check_it(i,j,theChessColor,down);
		}
	}

	if(chessLevel=="common")
	{
		for(i=0; (i<=7 && dAll==0); i=i+1)
		{
			for(j=0; (j<=7 && dAll==0); j=j+1)
			{
				if(!(i>=2&&i<=5&&j>=2&&j<=5))
					dAll = check_it(i,j,theChessColor,down);
			}
		}
	}
	else if((chessLevel=="middle")||(chessLevel=="advance"))
	{
		for(i=8; (i<96 && dAll==0); i=i+2)
		{
			dAll = check_it(VSet[i],VSet[i+1],theChessColor,down);	
		}		
	}

	// down==true表示已经在上面检查，并且吃子了
	if(down==true && dAll>0)
	{
		// 消除div，id="mention"的显示
		//document.getElementById("mention").style.display="none";
		
		if(theChessColor==1)
		{
			blackNum = blackNum + dAll + 1;
			whiteNum = whiteNum - dAll;
		}else
		{
			whiteNum = whiteNum + dAll + 1;
			blackNum = blackNum - dAll;		
		}
		// 改变显示的棋子个数
		freshChessNum();	
	}
	else if(((blackNum+whiteNum)<64) && (dAll==0))
	{
		// 在div，id="mention"，提示theChessColor不能落子，是否交换下棋方，看外层调用怎么处理	
		if(theChessColor==1)
		{
			mention_str = "黑棋";
		}
		else
		{
			mention_str = "白棋";	
		}
		document.getElementById("result").innerHTML = mention_str + "不能落子，交换下棋方";
		document.getElementById("result").style.display="block";
	}
	
	return dAll;
}

/**
机器下棋
*/
function robot_run(client_color,robot_color)
{
	var robot_chance = 0;
	var client_chance = 0;
	
	while(client_chance==0)
	{
		robot_chance = common_check(robot_color,true); 
		
		// 机器落子之后，也可能让另一方的棋活动
		client_chance = common_check(client_color,false);
		
		// 如果另一方没有活动可以改变棋盘，而且机器也同样不能落子
		if( (robot_chance==0)&&(client_chance==0) )
		{
// 双方都不能落子，设置标题显示这个状态，写配置告诉主控窗口，
// 也可以遮挡落子界面，退出这个循环	

			if((blackNum+whiteNum)<64)
			{
				document.getElementById("result").innerHTML = "僵局";
				document.getElementById("result").style.display="block";
			}
			break;
		}
	}
	
	// 转换下棋方为newChessColor之后，在newChessColor还有落子步数之前，
	// 每次落子之后，就要判断对方的落子可能，只要对方可能落子，哪怕newChessColor也可以再落子
	// 都要退出循环检查，把落子权交还给对方
	
	// 退出以上循环，要么双方僵持，要么client还有机会，
	// 如果第一次把下棋权转换给机器，就发生僵持，那么div，id="mention"的显示也没有消除？
	// 如果client还有机会，在client落子之前，消除div，id="mention"的显示
	if(client_chance>0)
	{
		//document.getElementById("mention").style.display="none";
		
		if(myChessColor==1)
			ContestStatus = "持黑子";
		else
			ContestStatus = "持白子";
		ContestStatus += ":" + "有落棋点";
		document.getElementById("result").innerHTML = ContestStatus;		
	}
}

/**
tbody中插入一行
*/
function insertRow(tbody,num)
{
	if(num==null)
	{
		var row = document.createElement("tr");
		tbody.appendChild(row);
		return row;
	}else
	{
		var row = document.createElement("tr");
		tbody.insertBefore(row,tbody.childNodes[num]);
		return row;
	}
}

/**
tr中插入一行
*/
function insertCell(row)
{
	var cell = document.createElement("td");
	row.appendChild(cell);
	return cell;
}

//删除字节点
function deleteChild(par)
{
	var temp=new Array();
	var childNodes=par.childNodes;
	for(var i=0;i<childNodes.length;i=i+1)
	{
		temp.push(childNodes[i]);
	}
	for(var i=0;i<temp.length;i=i+1)
	{
		par.removeChild(temp[i]);
	}
}

/**
棋盘开启用户下棋事件
*/
function OpenChessTableOnchess()
{
	document.getElementById("bind").style.display="none";
}

/**
棋盘遮罩用户下棋事件
*/
function CoverChessTableOnchess()
{
	document.getElementById("bind").style.display="block";
}

function exitGame()
{
	//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","");
}

//初始化棋盘
function initChessTable()
{
	var chessTable=document.getElementById("chessTable"); // tbody
	
	//uId = GadgetGame.User.NickName;
	//CounterPartId = window.name;
	if(myChessColor==1)
		ContestStatus = "持黑子:开局";
	else
		ContestStatus = "持白子:有落棋点";
	//ContestStatus += ":" + System.Widget.Settings.readString(CounterPartId+uId+"ContestStatus");
	document.getElementById("result").innerHTML = ContestStatus;
	
	deleteChild(chessTable);
	lastStep="none";
	for(var i=0;i<8;i=i+1)
	{
		var row = insertRow(chessTable);
		for(var j=0;j<8;j=j+1)
		{
			var cell=insertCell(row);
			var num=i*8+j;
			
			cell.id="ID"+num;
			cell.innerHTML="&nbsp;";
			cell.className="tdStyle";
			cell.setAttribute("class","tdStyle");
			cell.align="center";
			cell.valign="middle";
			
			//cell.innerHTML=num;
			
			board[i][j] = 0;  //没有棋子			
			if ( ((i==3)&&(j==3)) || ((i==4)&&(j==4)))
			{
				board[i][j] = 1;
				cell.innerHTML="<img src=\"image/black.gif\" width=\"32\" height=\"32\" border=\"0\" />";
			}
			if ( ((i==3)&&(j==4)) || ((i==4)&&(j==3)) )
			{
				board[i][j] = 2;
				cell.innerHTML="<img src=\"image/white.gif\" width=\"32\" height=\"32\" border=\"0\" />";
			}
			//在初始化以后，所有棋盘变化的过程中，将鼠标移动到任何一个位置，应该要根据周围判断该位置是否可以显示target图标
			cell.onmouseover=function (){		//if 周围没有可以吃的子 是显示另一个图片
				if(this.innerHTML.indexOf("img")==-1 && this.innerHTML.indexOf("IMG")==-1)
				{
					//已经有棋子 不能再下了
					this.style.cssText="cursor:default;background:url(image/target.gif)";
				}				
			};
			cell.onmouseout=function (){
				this.style.cssText="cursor:default;background:url()";
			};
			cell.onclick=function ()
			{
				if(this.innerHTML.indexOf("img")!=-1 || this.innerHTML.indexOf("IMG")!=-1)
				{
					//已经有棋子 不能再下了
				}else                             //if 周围没有可以吃的子 也不可以下
				{
					var i;
					var j;
					var curX,curY;
					var myPic;
					var dAll;
					var temp=this.id.substring(2);
					var y=parseInt(temp%8);
					var x=parseInt((temp-temp%8)/8);		//以前的坐标转换，刚好是与正常顺序相反的
					
					dAll = check_it(x,y,myChessColor,true); 
					if(dAll>0)// 命中并且点击
					{						
						//如果在本机和机器对战，也需要禁用点击事件，直到机器也落定棋子
						CoverChessTableOnchess();
						this.style.cssText="cursor:default;background:url()"; //caution

						// 改为从棋盘的角度，看到某色棋的个数变化
						// 交换下棋双方											
						if(myChessColor==1)
						{
							blackNum = blackNum + dAll + 1;
							whiteNum = whiteNum - dAll;
							counterPartColor = 2;
						}else
						{
							whiteNum = whiteNum + dAll + 1;
							blackNum = blackNum - dAll;		
							counterPartColor = 1;
						}

						// 改变显示的棋子个数
						freshChessNum();	
						
						// 机器下棋，首先要知道机器的棋色
						robot_run(myChessColor,counterPartColor)
						OpenChessTableOnchess();
					}
				}
			};
			//初始化时，就可初始化棋盘的状态，同时插入几个棋子图标
		}
	}
	//开始获取用户状态信息
	//getPlayerStatus();
}

function OpenSetting()
{
	document.getElementById("help").style.display="none";	
	helpShow = false;			
	if(settingShow==false)
	{
		document.getElementById("setting").style.display="block";
		
		if(myChessColor==1)
		{
			document.getElementById("setting2b").checked = "true";
		}
		else
		{
			document.getElementById("setting2w").checked = "true";
		}
		
		if(chessLevel=="common")
		{
			document.getElementById("setting1c").checked = "true";
		}
		else if(chessLevel=="middle")
		{
			document.getElementById("setting1m").checked = "true";	
		}
		else
		{
			document.getElementById("setting1a").checked = "true";	
		}
			
		settingShow = true;
	}
	else
	{
		document.getElementById("setting").style.display="none";
		settingShow = false;		
	}
}

function SettingOk()
{
	var i;
	var queryString = "";
	
	var level = document.getElementsByName("setting1");
	var color = document.getElementsByName("setting2");
	
	for (i=0; i<level.length; i=i+1) {
		if (level[i].checked==true) {
			queryString = queryString + level[i].value;
		}
	}		
	chessLevel = queryString;
	
	queryString = "";
	for (i=0; i<color.length; i=i+1) {
		if (color[i].checked==true) {
			queryString = queryString + color[i].value;
		}
	}				
	myChessColor = parseInt(queryString);

	document.getElementById("passimg").style.display="none";
	document.getElementById("setting").style.display="none";
	settingShow = false;
	

	initChessTable();
	blackNum = 2;
	whiteNum = 2;	
	
	if(myChessColor==2)
	{
		// 机器下棋，首先要知道机器的棋色
		counterPartColor = 1;
		robot_run(myChessColor,counterPartColor);
	}
}

function OpenHelp()
{
	document.getElementById("setting").style.display="none";
	settingShow = false;			
	if(helpShow==false)
	{
		document.getElementById("help").style.display="block";
		helpShow = true;
	}
	else
	{
		document.getElementById("help").style.display="none";
		helpShow = false;		
	}	
}

function HelpOk()
{
	document.getElementById("help").style.display="none";	
	helpShow = false;		
}

function ExitOthello()
{
	//System.Widget.Close();	
	this.close();
}