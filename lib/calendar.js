$.widget('ui.calendar', {
	options: {
		width: false
	},
	_create: function() {
		var $this = this;
		if (this.options.width) {
			this.element.width(this.options.width);
		}
		this.element.disableSelection();
		this.calendarTable = $('<table cellpadding="0" cellspacing="0" class="calendar"><thead class="ui-widget-header"><tr><th class="ui-corner-tl" style="width: 50px;">&#160;</th><th class="day-header">Ma</th><th class="day-header">Ti</th><th class="day-header">Ke</th><th class="day-header">To</th><th class="day-header">Pe</th><th class="day-header">La</th><th class="ui-corner-tr day-header">Su</th></tr></thead></table>');
		this.calendarTableBody = $('<tbody />').appendTo(this.calendarTable);
		this.innerCalendarTableWrapper = $('<div style="overflow: auto; height: 100%;" />');
		this.calendarTableBody.append($('<tr />').append($('<td class="innercalendarcontainer" colspan="8" />').append(this.innerCalendarTableWrapper)));
		this.innerCalendarTable = $('<table cellpadding="0" cellspacing="0" class="innercalendar" />').appendTo(this.innerCalendarTableWrapper);
		this.innerCalendarTableBody = $('<tbody />').appendTo(this.innerCalendarTable);
		for (var hour = 0; hour < 24; hour++) {
			var row = $('<tr style="height: 50px;"><th id="hour-header-' + hour + '" class="ui-widget-header hour-header">' + hour + ':00</th></tr>');
			for (var day = 0; day < 7; day++) {
				row.append($('<td>&#160;</td>').mousedown(function() {
					$this.addevent({
						cell: $(this),
						title: 'Untitled',
						length: 1
					});
				}));
			}
			this.innerCalendarTableBody.append(row);
		}
		//var firstRow = this.calendarTableBody.find('tr:first-child');
		
		this.element.append(this.calendarTable);
		this.dayWidth = parseInt((this.element.width() - 50) / 7, 10);
		this.calendarTable.find('thead th.day-header,tbody td:not(.innercalendarcontainer)').width(this.dayWidth);
		this.innerCalendarTableBody.find('tr td:last-child').css('border-right', 'none');
		/*this.eventContainer = $('<div />').css({
			position: 'absolute',
			top: this.innerCalendarTableWrapper.offset().top + 'px',
			left: this.innerCalendarTableWrapper.offset().left + 'px',
			width: this.innerCalendarTableWrapper.width() + 'px',
			height: this.innerCalendarTableWrapper.height() + 'px',
			overflow: 'hidden'
		}).appendTo(this.element);*/
		this.innerCalendarTableWrapper.scroll(function() {
			$this._resizeCallback();
		});
		$(window).resize(function() {
			$this._resizeCallback();
		});
		//window.location.hash = '#hour-header-8';
		this.innerCalendarTableWrapper.scrollTop($('#hour-header-7').offset().top);
	},
	getCellByDayAndHour: function(day, hour) {
		var row = this.innerCalendarTableBody.find('tr').eq(hour);
		return row.find('td').eq(day - 1);
	},
	addevent: function(data) {
		var $this = this;
		var cell = data.cell || this.getCellByDayAndHour(data.day, data.startHour);
		var offset = cell.offset();
		var eventElement = $('<div class="calendar-event ui-corner-all" />')
			.append('<div class="calendar-event-title">' + data.title + '</div>')
			//.append('<span class="ui-resizable-s ui-resizable-handle ui-icon ui-icon-grip-dotted-horizontal calendar-event-resizehandle"></span>')
			.appendTo(this.element)
			.css({
				'background-color': data.color || '#f00',
				position: 'absolute',
				top: offset.top + 'px',
				left: offset.left + 'px',
			})
			.width(100)
			.height(data.length * 50)
			.resizable({handles: 's', grid: 25})
			.data({
				owningCell: cell,
				day: data.day,
				startHour: data.startHour,
				color: data.color,
				length: data.length
			})
			.draggable({
				grid: [this.dayWidth, 12.5],
				handle: '.calendar-event-title',
				containment: this.calendarTableBody,
				drag: function(event, ui) {
					if (ui.position.left < 50) {
						return false;
					}
				}
			})
			.dblclick(function (){
				$this._trigger('eventdoubleclick', null, {eventItem: this});
			});
	},
	_resizeCallback: function() {
		widget = this;
		this.element.find('.calendar-event').each(function() {
			var cell = $(this).data('owningCell');
			var offset = cell.offset();
			if (offset.top > widget.calendarTableBody.offset().top + widget.calendarTableBody.height()) {
				$(this).hide();
			}
			else {
				$(this).show();
			}
			$(this).css({
				top: offset.top + 'px',
				left: offset.left + 'px'
			});
			var width = $(this).outerWidth() + 3;
			var height = $(this).outerHeight() + 3;
			if (offset.top < widget.calendarTableBody.offset().top) {
				var clipTop = widget.calendarTableBody.offset().top - offset.top;
				$(this).css('clip', 'rect(' + clipTop +'px, ' + width + 'px, ' + height + 'px, 0px)');
			}
			else if (offset.top + height > widget.calendarTableBody.offset().top + widget.calendarTableBody.height()) {
				var clipBottom = height - (offset.top + height - (widget.calendarTableBody.offset().top + widget.calendarTableBody.height()));
				//alert(clipBottom);
				$(this).css('clip', 'rect(0px, ' + width + 'px, ' + clipBottom + 'px, 0px)');
			}
			else {
				$(this).css('clip', 'rect(0px, ' +  width + 'px, ' + height + 'px, 0px)');
			}
		});
	}
});