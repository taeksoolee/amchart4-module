function createChart({data, keys, title, isLegend}, chartId){
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(chartId, am4charts.XYChart)
    
    chart.colors.list = [
        am4core.color('red'),
        am4core.color('green'),
        am4core.color('blue'),
        am4core.color('yellow')
    ];
    chart.colors.step = 1;

    if(title!==undefined && title!==''){
        const chartTitle = chart.titles.create();
        chartTitle.text = title;
        chartTitle.fontSize = 25;
        chartTitle.marginBottom = 30;
    }

    if(isLegend){
        chart.legend = new am4charts.Legend()
        chart.legend.position = 'bottom'
        chart.legend.paddingBottom = 20
        chart.legend.labels.template.maxWidth = 95
    }

    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'category'
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;

    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.cursorTooltipEnabled = false;

    function createSeries(value, name) {
        var series = chart.series.push(new am4charts.ColumnSeries())
        series.dataFields.valueY = value
        series.dataFields.categoryX = 'category'
        series.name = name
        series.tooltipText = "{name} : {valueY}";
        series.events.on("hidden", arrangeColumns);
        series.events.on("shown", arrangeColumns);

        var bullet = series.bullets.push(new am4charts.LabelBullet())
        bullet.interactionsEnabled = false
        bullet.dy = 30;
        bullet.label.fill = am4core.color('#ffffff')

        return series;
    }

    chart.data = data

    keys.forEach(key => {
        createSeries(key, key);  
    })

    function arrangeColumns() {
        var series = chart.series.getIndex(0);

        var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
        if (series.dataItems.length > 1) {
            var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
            var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
            var delta = ((x1 - x0) / chart.series.length) * w;
            if (am4core.isNumber(delta)) {
                var middle = chart.series.length / 2;

                var newIndex = 0;
                chart.series.each(function(series) {
                    if (!series.isHidden && !series.isHiding) {
                        series.dummyData = newIndex;
                        newIndex++;
                    }
                    else {
                        series.dummyData = chart.series.indexOf(series);
                    }
                })
                var visibleCount = newIndex;
                var newMiddle = visibleCount / 2;

                chart.series.each(function(series) {
                    var trueIndex = chart.series.indexOf(series);
                    var newIndex = series.dummyData;
                    var dx = (newIndex - trueIndex + middle - newMiddle) * delta
                    series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                })
            }
        }

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = xAxis;
        chart.cursor.fullWidthLineX = true;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#ff0000");
        chart.cursor.lineX.fillOpacity = 0.1;
        chart.cursor.behavior = "selectX";
        chart.cursor.lineY.disabled = true;

        chart.cursor.events.on("cursorpositionchanged", function(ev) {
            chart.cursor.triggerMove(ev.target.point, "soft");
        });
    }
}