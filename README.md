# cron-selector
一个基于jquery的cron选择器

示例
var cronSelector = $.cronSelector({
                                container:'#cronSelector',
                                locatedWeek:true
                            });

api:
  val():获取选取的cron
  parseVal():根据传入的cron渲染选择器
 
选项:
  container:主元素选择器
  locatedWeek+:是否将日/周本地化
