app.directive('n1bTimer', function(Minions) {
    return {
        restrict: 'A',
        scope: {
            startDate: '='
        },
        link: function(scope, element, attrs) {
            var date = new Date(scope.startDate);
            createTimer(element[0], date);

            function toMinutes(millis){
                return Math.floor(millis/(1000*60))
            }

            function createTimer(element,start){
                var paper = Raphael(element, '100%', '100%');
                //---- calculate dimensions and size
                var width = paper.canvas.offsetHeight;
                var height= paper.canvas.offsetWidth;
                var side = Math.min(width,height);
                var R = side*3.0/8.0;
                var center = side/2;
                var archWidth = side/15.0;
                var fontSize = side/5;
                var markRadius = side/150;
                var init = true,
                    param = {stroke: "#fff", "stroke-width": archWidth},
                    marksAttr = {fill: "#fff", stroke: "none",r:markRadius}, textAttr =
                    {fill: "#FFF",'font-size':fontSize,'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif'}


                //---- Custom Attribute
                paper.customAttributes.arc = function (value, total, R) {
                    var alpha = 360 / total * value,
                        a = (90 - alpha) * Math.PI / 180;
                    var x = center + R * Math.cos(a);
                    var y = center - R * Math.sin(a);
                    var color = "hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)");
                    var path;
                    if (total == value) {
                        path = [["M", center, center - R], ["A", R, R, 0, 1, 1,center - 0.01, center -
                        R]];
                    } else {
                        path = [["M", center, center - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
                    }
                    return {path: path, stroke: color};
                };

                //--- draw components
                drawMarks(R, 60);
                var sec = paper.path().attr(param).attr({arc: [0, 60, R]});
                var text = paper.text(center, center, "").attr(textAttr);

                function updateVal(value, total, R, hand) {
                    if (init) {
                        hand.animate({arc: [value, total, R]}, 900, ">");
                    } else {
                        if (!value || value == total) {
                            value = total;
                            hand.animate({arc: [value, total, R]}, 750, "bounce", function () {
                                hand.attr({arc: [0, total, R]});
                            });
                        } else {
                            hand.animate({arc: [value, total, R]}, 750, "elastic");
                        }
                    }
                }

                function drawMarks(R, total) {
                    var out = paper.set();
                    for (var value = 0; value < total; value++) {
                        var alpha = 360 / total * value,
                            a = (90 - alpha) * Math.PI / 180,
                            x = center + R * Math.cos(a),
                            y = center - R * Math.sin(a);
                        out.push(paper.circle(x, y, 2).attr(marksAttr));
                    }
                    return out;
                }

                //--- start clock
                (function () {
                    var d = new Date((new Date()).getTime() - start.getTime());
                    updateVal(d.getSeconds(), 60, R, sec, 2);

                    text.attr({text: toMinutes(d.getTime()) + 'm'})

                    setTimeout(arguments.callee, 1000);
                    init = false;
                })();
            }
        }
    }
});
app.factory('Minions', function($q) {
    var Minions = {};

    var TYPE_ID = {
        FEDERATION_NAVY_STASIS_WEBIFIER : 17559
    }

    var DD  = {
        VINDICATOR : 17740 ,
        ROKH : 24688 ,
        NIGHTMARE : 17736 ,
        MAELSTROM : 24694 ,
        HYPERION : 24690 ,
        MACHARIEL : 17738
    }

    var LL  = {
        SCIMITAR : 11978 ,
        BASILISK : 11985
    }

    function parseSlot(str){
        var arr = str.split(';');
        return {id: arr[0],n:arr[1]};
    }

    Minions.teardownShipFit = function(shipDNA){
        var slots = shipDNA.split(':')

        var type = slots.shift();
        var modules = slots.map(parseSlot);

        var ship = {type : type, modules : modules};
        return ship;
    }

    Minions.linkCharacter = function(id,name){
        return '<url=showinfo:1373\/\/' + id + '>' + name +'</url>'
    }

    Minions.linkFit = function(shipDNA,shipName){
        return '<url=fitting:' + shipDNA + '>' + shipName + '</url>'
    }

    Minions.waitlist2ascii = function(waitlist,head,foot){
        var list =  [];

        waitlist.waitlist.forEach(function (item) {
            var char = item.characterName
            var line = ' * ' + char + ' \t ';
            item.fittings.forEach(function (fitting) {
                line += fitting.role;
                line += ', ';
            })
            line += '\n';
            list.push(line);
        })
        list = list.join('');

        var ascii = '.\n';
        var prename = waitlist.owner.characterName.split(' ')[0];
        head = head.replace('%n',prename)
        ascii = ascii.concat(head);
        ascii = ascii.concat('\n');
        ascii = ascii.concat(list);
        ascii = ascii.concat(foot)
        return ascii;
    }

    Minions.waitlistStats = function (waitlistVO) {
        var count = {};
        waitlistVO.waitlist.forEach(function (item) {
            item.fittings.forEach(function (fitting) {
                if(fitting.role){
                    var type = fitting.role[0];
                    count[type] = (count[type] ? count[type] : 0) + 1;
                }else{
                    count.u = (count.u ? count.u : 0) + 1;
                }
            })
        })
        return count;
    };

    Minions.waitlistStatsTxt = function(waitlistVO){
        var count = Minions.waitlistStats(waitlistVO)
        var str = '';
        for (var key in count) {
            if (count.hasOwnProperty(key)) {
                var line = ' / ' + key + ': '+  count[key]
                str = str.concat(line);
            }
        }
        return str;
    }

    Minions.getQueryParam = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    return Minions;
});