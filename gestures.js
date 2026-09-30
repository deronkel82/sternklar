// A deliberate rightward swipe beginning near the left edge of a detail sheet.
export function isBackSwipe(start,end,{edge=72,distance=80}={}){
 if(!start||!end||start.x<8||start.x>edge)return false;
 const dx=end.x-start.x,dy=Math.abs(end.y-start.y);
 return dx>=distance&&dy<=Math.min(75,dx*.55);
}
