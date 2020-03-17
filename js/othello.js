var myChessColor; // �ҵ����ӵ���ɫ
var chessLevel;
// onclick����Ӧ�����ȫ�����к��Ժ󣬵��������㷨��������ֽ׶α�������

var counterPartColor;

var board; 
var directionSeq; // ���λ�õĸ���״��
var now_show_focus; // ����ƶ�����λ����û�п��ԳԵ�		
var dir; //����������
var uId;
var CounterPartId;
var ContestStatus; 

// �������꼯�ϱ�
var VSet;

var settingShow=false;
var helpShow=false;
var lastStep="none"; // ���һ����

// ���������Ӹ���
var blackNum = 2;
var whiteNum = 2;


// ÿ��Cell��Ϊһ�������ϵ�Ԫ��
function SeqCell()
{
	// Set the initial state for this cell
	this.x = 0;
	this.y = 0;
	this.color = 1;
	this.num = 0; // ��������û�����¼���Ǹ�������Ҫ�û��ĸ����� 
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
	
	//�˸�����ı�ţ�0-up,1-upright,2-right,3-rightdown,4-down,5-leftdown,6-left,7-leftup
	directionSeq = new Array(8);
	for(i=0; i<8; i=i+1)
	{
		directionSeq[i] = new SeqCell();
	}
	
	VSet = [0,0,0,7,7,0,7,7,
	0,2,0,3,0,4,0,5,7,2,7,3,7,4,7,5,2,0,3,0,4,0,5,0,2,7,3,7,4,7,5,7,
	1,2,1,3,1,4,1,5,6,2,6,3,6,4,6,5,2,1,3,1,4,1,5,1,2,6,3,6,4,6,5,6,
	0,1,0,6,1,0,1,1,1,6,1,7,6,0,6,1,6,6,6,7,7,1,7,6]; // 4*2,16*2,16*2,12*2

	myChessColor = 1; // Ĭ��Ϊ���ӣ�����
	chessLevel = "common"; // Ĭ��Ϊ��ͨ����
}

// ���ݵ�ǰ�Լ��ͶԷ������Ӹ������ı�ĳ����Ԫ��������ʾ
// ��div����ʾ����˫����ս��
function freshChessNum()
{
	document.getElementById("bNum").innerHTML=blackNum.toString();
	document.getElementById("wNum").innerHTML=whiteNum.toString();
	
	if((blackNum+whiteNum)==64)
	{
		if(myChessColor==1 && blackNum>whiteNum)
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","IWon");
			document.getElementById("result").innerHTML = "�ֺ���:Ӯ��";
		}
		else if(myChessColor==2 && whiteNum>blackNum)
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","IWon");
			document.getElementById("result").innerHTML = "�ְ���:Ӯ��";			
		}
		else if(whiteNum==blackNum)
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","Equal");
			document.getElementById("result").innerHTML = "ƽ��";
		}
		else
		{
			//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","GameOver");
			document.getElementById("result").innerHTML = "����Ӯ��";
		}			
		document.getElementById("passimg").style.display="block";
	}
}

/**
���һ������ͼƬ ���� ����������Ӹ����ɲ�����ģ����ͼƬ��ͬʱ��
�Ϳ��Դ�����ΧͼƬ�ı仯��ͬʱҪ�ı䱾�ļ�ά��������
*/
function changeChess(chess,pre)
{
	if(chess.indexOf("-")==-1)
	{
		return;
	}
	var temp = chess.split("-");
	var num = parseInt(temp[0])*8+parseInt(temp[1]);                 //��ǰ���Ǵ˴�Ҳ�Ƿ���
	if(temp[2]==1)
	{
		document.getElementById("ID"+num).innerHTML="<img src=\"image/black"+pre+".gif\" width=\"32\" height=\"32\" border=\"0\" />";
	}else
	{
		document.getElementById("ID"+num).innerHTML="<img src=\"image/white"+pre+".gif\" width=\"32\" height=\"32\" border=\"0\" />";
	}
}

/*
��һ������
*/
function putAchess(x,y,chess)
{
	var chessStr=x+"-"+y+"-"+chess; // �������ӵ�λ�ã���ͬ��½������room��ţ��������߷���������������Ϣ
	if(lastStep!="none") // ����ܻ��ӣ�����Ĳ������б�Ҫ����
	{
		//�ҵ���һ��λ��,�ѽ���ת����,update
		var temp = lastStep.split("-");
		var x1 = parseInt(temp[0]);
		var y1 = parseInt(temp[1]);
		if(temp[2]==board[x1][y1]) //���û�б��Ե���û�иı�����ͼ��
		{
			changeChess(lastStep,""); //�ſ�����ԭ����ͼ������ϻ�һ�㣬����Ͱ׳��ˣ����������ָֻ���
		}
	}
	lastStep=chessStr;
}


//board �� myChessColor���ⶼ�ǹ��õ�
//���㵱ǰ�ṩ��������ĳ�������ϿɳԶԷ��ӵĸ�����������ӿɳԣ��ͱ�����̣�ͬʱ�ı���ҳ
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
	// �����������ϵĳ���
	curX = x+dx;
	curY = y+dy;
	while (curX<8&&curY<8&&curX>=0&&curY>=0 && board[curX][curY]==eatChess)
	{
		posNum=posNum+1;
		curX = curX+dx;
		curY = curY+dy;
	}	
	// ���Խ����Ҳ����Լ����ӣ���ô�Ͳ����ԳԶԷ�����
	if (!(curX<8&&curY<8&&curX>=0&&curY>=0)||board[curX][curY]==0)
	{
		posNum = 0;
	}
	if (posNum>0)
	{
		//���Ӻʹ������̵���ʾ
		curX = x+dx;
		curY = y+dy;
		for (var i=1; i<=posNum; i=i+1)
		{
			board[curX][curY] = theChessColor;  //���̱������
			//�ı���ҳ
			num = curX*8+curY;
			document.getElementById("ID"+num).innerHTML="<img src=\"image/"+myPic+"\" width=\"32\" height=\"32\" border=\"0\"/>";
			curX = curX+dx;
			curY = curY+dy;
		}
	}
	// ���������ϵĳ���
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
		//���Ӻʹ������̵���ʾ
		curX = x-dx;
		curY = y-dy;
		for (var j=1; j<=negNum; j=j+1)
		{
			board[curX][curY] = theChessColor;  //���̱������
			//�ı���ҳ
			num = curX*8+curY;
			document.getElementById("ID"+num).innerHTML="<img src=\"image/"+myPic+"\" width=\"32\" height=\"32\" border=\"0\" />";
			curX = curX-dx;
			curY = curY-dy;
		}
	}
	return posNum+negNum;
}

/**
�������λ�ú����ӵ���ɫ�����������������ӵĿ���
���һ��������Ϊ��־�����֣�Ԥ���жϡ����ߵ���гԾ͸ı��߼�������
*/
function check_it(x,y,theChessColor,down)
{
	//�˸�����ı�ţ�0-up,1-upright,2-right,3-rightdown,4-down,5-leftdown,6-left,7-leftup
	//1. ��Χ��������ɫ�� 2. ������ĳ��������Գԣ�
	//��Ȼ�����8������һȦһȦ���ڸ����������ϴε������޶��´������ķ�Χ
	
	//�´����������ı仯����Ҫ�����ϴν���Ĵ洢
	//tһ�£���ʼ����ɫ��������ͬɫ����һ����������Ϳ���ֹͣ�������������ؿɳԵı�־
	//û�п�ʼ�ͽ��������п�ʼ�Ķ�û�н���������û�пɳԵı�־
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
			// ��־����Ϊ���ɳԣ���ǰ������һ������
			directionSeq[i].num = 0;
			continue;
			// ���˱߽����⣬Ҳû�з���ͬɫ��������������ж�
		}
		// �������ɫ���������־����Ϊ�ɳԣ����ּ���i�������ڿ����û��ĸ���
		// ���û����ɫ����־����Ϊ���ɳԣ��ÿɳԵĸ���Ϊ0��ʾ	
// ����Ϊ���ӵ�Ψһ��������		
		if(board[nX][nY]==theChessColor && (directionSeq[i].num)>0)
		{
			// show_focus = true; // ֻҪ��һ���ط��в�����0����������еĳ�
			// ��������ӵĶ������������Զ��㷨���Ѿ��������ӵ�ʱ��
			dAll += (directionSeq[i].num);
			if(down==true)
			{
				for(j=0; j<directionSeq[i].num; j=j+1)
				{
					nX -= dir[i].dx;
					nY -= dir[i].dy;	
								
					// �ҵ����򡢸���֮�󣬸ı��߼��ͽ�������̾���
					pos_num = nX*8+nY;								
					board[nX][nY] = theChessColor;
					document.getElementById("ID"+pos_num).innerHTML="<img src=\"image/"+thePic+".gif\" width=\"32\" height=\"32\" border=\"0\" />";		
				}				
			}
		}
		else if(board[nX][nY]!=theChessColor && (directionSeq[i].num)>0)
		{
			directionSeq[i].num = 0;// ����������ϲ�ֹһ����ɫ���壬ֱ���������̿հ�	
		}
	}

	if(down==true && dAll>0)
	{
		//��һ������								
		board[x][y] = theChessColor;
		putAchess(x,y,theChessColor);
		pos_num = x*8+y;	
		document.getElementById("ID"+pos_num).innerHTML="<img src=\"image/"+thePic+"2.gif\" width=\"32\" height=\"32\" border=\"0\" />";
	}

	return dAll;
}

/**
��ͨ����Ļ�������
�ı����̡��߼����飬���ϵ�һ�����û�еط����ӣ���Ҫ����һ��״̬
*/
function common_check(theChessColor,down)
{
	var i,j;
	var mention_str;
	var dAll = 0;

	// ����Ȩ������
	// eval��ѭ�����
	//��Ŀǰ��������������

	// һ��������Ҫ�������Ϊ�������������������ǰ�ҵ��������λ�ã�
	// ���λ�õļ�¼��Ҫ�����������ŵ�����������£�����˵����������û�������꣩Ϊֹ���ڸ��ŵ��������ֱ����������
	// �����ȵ�����û�У�����ѡ������ȵ�����
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

	// down==true��ʾ�Ѿ��������飬���ҳ�����
	if(down==true && dAll>0)
	{
		// ����div��id="mention"����ʾ
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
		// �ı���ʾ�����Ӹ���
		freshChessNum();	
	}
	else if(((blackNum+whiteNum)<64) && (dAll==0))
	{
		// ��div��id="mention"����ʾtheChessColor�������ӣ��Ƿ񽻻����巽������������ô����	
		if(theChessColor==1)
		{
			mention_str = "����";
		}
		else
		{
			mention_str = "����";	
		}
		document.getElementById("result").innerHTML = mention_str + "�������ӣ��������巽";
		document.getElementById("result").style.display="block";
	}
	
	return dAll;
}

/**
��������
*/
function robot_run(client_color,robot_color)
{
	var robot_chance = 0;
	var client_chance = 0;
	
	while(client_chance==0)
	{
		robot_chance = common_check(robot_color,true); 
		
		// ��������֮��Ҳ��������һ������
		client_chance = common_check(client_color,false);
		
		// �����һ��û�л���Ըı����̣����һ���Ҳͬ����������
		if( (robot_chance==0)&&(client_chance==0) )
		{
// ˫�����������ӣ����ñ�����ʾ���״̬��д���ø������ش��ڣ�
// Ҳ�����ڵ����ӽ��棬�˳����ѭ��	

			if((blackNum+whiteNum)<64)
			{
				document.getElementById("result").innerHTML = "����";
				document.getElementById("result").style.display="block";
			}
			break;
		}
	}
	
	// ת�����巽ΪnewChessColor֮����newChessColor�������Ӳ���֮ǰ��
	// ÿ������֮�󣬾�Ҫ�ж϶Է������ӿ��ܣ�ֻҪ�Է��������ӣ�����newChessColorҲ����������
	// ��Ҫ�˳�ѭ����飬������Ȩ�������Է�
	
	// �˳�����ѭ����Ҫô˫�����֣�Ҫôclient���л��ᣬ
	// �����һ�ΰ�����Ȩת�����������ͷ������֣���ôdiv��id="mention"����ʾҲû��������
	// ���client���л��ᣬ��client����֮ǰ������div��id="mention"����ʾ
	if(client_chance>0)
	{
		//document.getElementById("mention").style.display="none";
		
		if(myChessColor==1)
			ContestStatus = "�ֺ���";
		else
			ContestStatus = "�ְ���";
		ContestStatus += ":" + "�������";
		document.getElementById("result").innerHTML = ContestStatus;		
	}
}

/**
tbody�в���һ��
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
tr�в���һ��
*/
function insertCell(row)
{
	var cell = document.createElement("td");
	row.appendChild(cell);
	return cell;
}

//ɾ���ֽڵ�
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
���̿����û������¼�
*/
function OpenChessTableOnchess()
{
	document.getElementById("bind").style.display="none";
}

/**
���������û������¼�
*/
function CoverChessTableOnchess()
{
	document.getElementById("bind").style.display="block";
}

function exitGame()
{
	//System.Widget.Settings.writeString(CounterPartId+uId+"ContestStatus","");
}

//��ʼ������
function initChessTable()
{
	var chessTable=document.getElementById("chessTable"); // tbody
	
	//uId = GadgetGame.User.NickName;
	//CounterPartId = window.name;
	if(myChessColor==1)
		ContestStatus = "�ֺ���:����";
	else
		ContestStatus = "�ְ���:�������";
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
			
			board[i][j] = 0;  //û������			
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
			//�ڳ�ʼ���Ժ��������̱仯�Ĺ����У�������ƶ����κ�һ��λ�ã�Ӧ��Ҫ������Χ�жϸ�λ���Ƿ������ʾtargetͼ��
			cell.onmouseover=function (){		//if ��Χû�п��ԳԵ��� ����ʾ��һ��ͼƬ
				if(this.innerHTML.indexOf("img")==-1 && this.innerHTML.indexOf("IMG")==-1)
				{
					//�Ѿ������� ����������
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
					//�Ѿ������� ����������
				}else                             //if ��Χû�п��ԳԵ��� Ҳ��������
				{
					var i;
					var j;
					var curX,curY;
					var myPic;
					var dAll;
					var temp=this.id.substring(2);
					var y=parseInt(temp%8);
					var x=parseInt((temp-temp%8)/8);		//��ǰ������ת�����պ���������˳���෴��
					
					dAll = check_it(x,y,myChessColor,true); 
					if(dAll>0)// ���в��ҵ��
					{						
						//����ڱ����ͻ�����ս��Ҳ��Ҫ���õ���¼���ֱ������Ҳ�䶨����
						CoverChessTableOnchess();
						this.style.cssText="cursor:default;background:url()"; //caution

						// ��Ϊ�����̵ĽǶȣ�����ĳɫ��ĸ����仯
						// ��������˫��											
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

						// �ı���ʾ�����Ӹ���
						freshChessNum();	
						
						// �������壬����Ҫ֪����������ɫ
						robot_run(myChessColor,counterPartColor)
						OpenChessTableOnchess();
					}
				}
			};
			//��ʼ��ʱ���Ϳɳ�ʼ�����̵�״̬��ͬʱ���뼸������ͼ��
		}
	}
	//��ʼ��ȡ�û�״̬��Ϣ
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
		// �������壬����Ҫ֪����������ɫ
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