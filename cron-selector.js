(function($){
    if(!$){
        throw 'cron-selector : JQuery is needed'
    }
    var timeTypes = ['second','minute','hour','day','month','week','year'],
    timeNames = ['秒','分','时','日/月','月','日/周','年'],
    timeValues = ['0-59','0-59','0-23','1-31','1-12','1-7','1970-2099'],
    localWeekSequence = ['2','3','4','5','6','7','1'],
    weekChar = ['/','-','*',',','?','L','C','#'],
    typeSelectorClass = 'typeSelector',
    valueCheckBoxClass = 'valueCheckBox',
    startInputClass = 'start',
    endInputClass = 'end',
    distanceInputClass = 'distance',
    defaultOptions = {
        containerClass:'',
        locatedWeek:false
    },
    selectorTypeEnum = {
        period:'period',
        assign:'assign',
        empty:'empty',
    };
    var typeToName = function (timeType) {
        return timeNames[timeTypes.indexOf(timeType)];
    };
    var typeToValueScope = function (timeType) {
        var timeValue = timeValues[timeTypes.indexOf(timeType)];
        return timeValue ? timeValue.split('-') : timeValue;
    };
    $.cronSelector = function(options){
        var options = this.options = $.extend(defaultOptions,options);
        var container = this.container = $('<div class="pb-tag-box ' + this.options['containerClass'] + '"></div>').appendTo($(options['container']));
        //初始化时间类型切换html
        var renderTabHtml = function(){
            var tabHtml = ['<div class="pb-tag">'];
            var tabItemHtml = ['<div class="pb-tag-body">'];
            for(var i = 0 ; i < timeTypes.length ; i++){
                tabHtml.push('<div class="pb-tag-item" tabCode="'+timeTypes[i]+'">'+timeNames[i]+'</div>');
                tabItemHtml.push('<div class="pb-tag-body-item" tabItemCode="'+timeTypes[i]+'" style="display: none"></div>');
            }
            tabHtml.push('</div>');
            tabItemHtml.push('</div>');
            container.append(tabHtml.join(''));
            return container.append(tabItemHtml.join(''));
        };
        var getTimeItemContainer = function(timeType){
            return $('div[tabItemCode='+timeType+']',container);
        };
        //初始化周期时间类型选择器
        var renderPeriodHtml = function(timeType){
            var timeContainer = getTimeItemContainer(timeType);
            var typeName = typeToName(timeType);
            var valueScope = typeToValueScope(timeType) || ['',''];
            var min = valueScope[0];
            var max = valueScope[1];
            $(timeContainer).append('<div class="pb-form-item">\n' +
                '                        <input class="'+typeSelectorClass+' pb-form-check" type="checkbox" name="'+selectorTypeEnum.period+'"> 从<input class="pb-form-input '+startInputClass+'" type="number" min="'+min+'" max="'+max+'">'+typeName+'开始,\n' +
                '                        到<input class="pb-form-input '+endInputClass+'" type="number" min="'+min+'" max="'+max+'">'+typeName+'结束,\n' +
                '                        每<input class="pb-form-input '+distanceInputClass+'" type="number" min="0" max="'+(max-min)+'">'+typeName+'执行一次\n' +
                '                </div>');

        };
        //初始化指定时间类型选择器
        var renderAssignHtml = function(timeType){
            var timeContainer = getTimeItemContainer(timeType);
            var valueScope = typeToValueScope(timeType);
            if(valueScope){
                var timeValues = ['<div class="assignInput">\n' +
                '                    <span class="pb-form-item">\n' +
                '                        <input class="'+typeSelectorClass+' pb-form-check" type="checkbox" name="'+selectorTypeEnum.assign+'">指定时间' +
                '                    </span>'];
                for(var i = valueScope[0];i <= valueScope[1];i++){
                    timeValues.push('<span class="pb-form-item">\n' +
                        '                        <input class="pb-form-check '+valueCheckBoxClass+'" type="checkbox" value="'+i+'">' + i +
                        '                    </span>');
                }
                timeValues.push('</div>');
                $(timeContainer).append(timeValues.join(''));
            }
        }
        //初始化时间类型选择器
        var renderTimeItemHtml = function(){
            for(var i= 0;i<timeTypes.length;i++){
                renderPeriodHtml(timeTypes[i]);
                renderAssignHtml(timeTypes[i]);
            } 
        };
        //初始化html
        var renderHtml = function(){
            var tabItemContainer = renderTabHtml(container);
            renderTimeItemHtml(tabItemContainer);
            
        };
        //初始化时间类型切换事件
        var initTabChooseEvent = function(){
            $('[tabcode]').click(function(){
                var code = $(this).attr('tabcode');
                $(this).addClass('active').siblings().removeClass('active');
                $('div[tabitemcode=' + code + ']').show().siblings().hide();
            });
        };
        //清空该时间类型下的所有输入
        var clearInput = function(timeType){
            var timeContainer = getTimeItemContainer(timeType);
            timeContainer.find("input").prop("checked", false);
        };
        //初始化时间选择类型互斥事件
        var initMutualEvent = function(){
            $('div[tabItemCode]',container).each(function(){
                var _this = $(this);
                var timeType = $(this).attr('tabItemCode');
                $('input.'+typeSelectorClass,_this).on('change',function(){
                    if($(this).prop('checked')) {
                        $('input.'+typeSelectorClass,_this).not($(this)).prop('checked',false);
                        if(timeType == 'week'){
                            clearInput('day');
                        }
                        if(timeType == 'day'){
                            clearInput('week');
                        }
                    }
                });
            });
        };
        //获得指定时间类型的值
        var getTimeValue = function(timeType){
            var checkedSelect = getTimeItemContainer(timeType).find('input.'+typeSelectorClass+':checked');
            var selectorType = checkedSelect.length>0 ? checkedSelect.attr('name') : selectorTypeEnum.empty;
            if(selectorType == selectorTypeEnum.period){
                return getPeriodValue(timeType);
            }else if(selectorType == selectorTypeEnum.assign){
                return getAssignValue(timeType);
            }else if(selectorType == selectorTypeEnum.empty){
                return getEmptyValue(timeType);
            }
        };
        //获得周期时间选择器的值
        var getPeriodValue = function(timeType){
            var timeContainer = getTimeItemContainer(timeType)
            var start = $('input.'+startInputClass,timeContainer).val();
            var end = $('input.'+endInputClass,timeContainer).val();
            var distance = $('input.'+distanceInputClass,timeContainer).val();
            var value = start || ''; 
            if(end && start){
                value += ('-' + end)
            }
            if(distance){
                value += ('/' + distance);
            }
            return value || '*';

        };
        //获得指定时间选择器的值
        var getAssignValue = function(timeType){
            var timeContainer = getTimeItemContainer(timeType);
            var selectedValues = [];
            $('input.'+valueCheckBoxClass+':checked',timeContainer).each(function () {
                selectedValues.push($(this).attr("value"));
            });
            return selectedValues.join(',') || '0';
        };
        //是否将日/周本地化
        var translateWeek = function(weekTime,reverse){
            if(!weekTime){
                return weekTime;
            }
            var weekDays = weekTime.split('');
            for(var i = 0;i < weekDays.length;i++){
                if(weekChar.indexOf(weekDays[i]) == -1){
                    if(reverse){
                        weekDays[i] = localWeekSequence.indexOf(weekDays[i]) + 1;
                    }else {
                        weekDays[i] = localWeekSequence[parseInt(weekDays[i]) - 1];
                    }
                }
            }
            return weekDays.join('');
        }
        //获得空值
        var getEmptyValue = function(timeType){
            if(timeType == 'week' || timeType == 'day'){
                return '?'
            }
            return "*"
        };
        var isNumber = function(value){
            var re = /^[0-9]+.?[0-9]*$/;
            return re.test(value)
        };
        //根据值获取对应选择器类型
        var getTimeValueSelectorType = function(value){
            if(!value || value == '*' || value == '?'){
                return selectorTypeEnum.empty;
            }
            if(value.indexOf('/') != -1 || value.indexOf('-') != -1){
                return selectorTypeEnum.period;
            }
            if(value.indexOf(',') != -1 || isNumber(value)){
                return selectorTypeEnum.assign;
            }
        };
        //初始化周期时间
        var initPeriodValue = function(value,timeType){
            var timeContainer = getTimeItemContainer(timeType);
            $('input[name="'+selectorTypeEnum.period+'"]',timeContainer).prop("checked",true);
            var values = value.split('/');
            var startAndEnd = values[0].split('-');
            if(startAndEnd != '*') {
                $('input.'+startInputClass, timeContainer).val(startAndEnd[0]);
                if(startAndEnd.length > 1) {
                    $('input.'+endInputClass, timeContainer).val(startAndEnd[1]);
                }
            }
            if(values.length > 1) {
                var period = values[1];
                $('input.'+distanceInputClass, timeContainer).val(period);
            }
        };
        //初始化指定时间
        var initAssignValue = function(value,timeType){
            var timeContainer = getTimeItemContainer(timeType);
            $('input[name="'+selectorTypeEnum.assign+'"]',timeContainer).prop("checked",true);
            var selectedValues = value.split(',');
            for(var i = 0;i < selectedValues.length;i++){
                $('input[value='+selectedValues[i]+'].'+valueCheckBoxClass,timeContainer).prop('checked',true);
            }
        };
        var initEvent = function(){
            initTabChooseEvent();
            initMutualEvent();
        };
        var init = function(){
            renderHtml();
            initEvent(); 
        };
        init();
        this.val = function(){
            var values = [];
            for(var i = 0;i < timeTypes.length;i++){
                values.push(getTimeValue(timeTypes[i]));
            } 
            var weekValue = values[timeTypes.indexOf('week')]; 
            if(weekValue == '?' && values[timeTypes.indexOf('day')] == '?'){
                values[timeTypes.indexOf('day')] = '*' 
            }
            if(this.options['locatedWeek']){
                values[timeTypes.indexOf('week')] = translateWeek(weekValue);
            }
            return values.join(' ');
        };
        this.parseVal = function(value){
            var timeValues = value.split(' ');
            timeValues[timeTypes.indexOf("week")] = translateWeek(timeValues[timeTypes.indexOf("week")],true);
            for(var i = 0;i < timeValues.length;i++){
                var timeValue = timeValues[i];
                var timeType = timeTypes[i];
                var selectorType = getTimeValueSelectorType(timeValue);
                if(selectorType == selectorTypeEnum.assign){
                    initAssignValue(timeValue,timeType);
                }else if(selectorType == selectorTypeEnum.period){
                    initPeriodValue(timeValue,timeType);
                }
            }
        };
        return this;
    }
})($)