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
		this.calendarTable = $('<table cellpadding="0" cellspacing="0" class="calendar"><thead class="ui-widget-header"><tr><th id="week-header-hourspacer" class="ui-corner-tl">&#160;</th><th class="day-header">Ma</th><th class="day-header">Ti</th><th class="day-header">Ke</th><th class="day-header">To</th><th class="day-header">Pe</th><th class="day-header">La</th><th class="ui-corner-tr day-header">Su</th></tr></thead></table>');
		this.calendarTableBody = $('<tbody />').appendTo(this.calendarTable);
		this.innerCalendarTableWrapper = $('<div style="overflow: auto; height: 100%;" />');
		this.calendarTableBody.append($('<tr />').append($('<td class="innercalendarcontainer" colspan="8" />').append(this.innerCalendarTableWrapper)));
		this.innerCalendarTable = $('<table cellpadding="0" cellspacing="0" class="innercalendar" />').appendTo(this.innerCalendarTableWrapper);
		this.innerCalendarTableBody = $('<tbody />').appendTo(this.innerCalendarTable);
		for (var hour = 0; hour < 24; hour++) {
			var row = $('<tr style="height: 60px;"><th id="hour-header-' + hour + '" class="ui-widget-header hour-header">' + hour + ':00</th></tr>');
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
		
		this.element.append(this.calendarTable);
		this.dayWidth = parseInt((this.element.width() - 80) / 7, 10);
		this.calendarTable.find('thead th.day-header,tbody td:not(.innercalendarcontainer)').width(this.dayWidth);
		this.hourHeaderWidth = $('.hour-header').outerWidth() + 1;
		$('#week-header-hourspacer').width(this.hourHeaderWidth);
		this.innerCalendarTableBody.find('tr td:last-child').css('border-right', 'none');
		this.innerCalendarTableWrapper.scroll(function() {
			$this._resizeCallback();
		});
		$(window).resize(function() {
			$this._resizeCallback();
		});
		this.innerCalendarTableWrapper.scrollTop($('#hour-header-7').offset().top);
	},
	getCellByDayAndHour: function(day, hour) {
		var row = this.innerCalendarTableBody.find('tr').eq(hour);
		return row.find('td').eq(day - 1);
	},
	getCellByOffset: function(top, left) {
		var widget = this;
		var cell = null;
		this.innerCalendarTableBody.find('td').each(function() {
			var cellOffset = $(this).offset();
			if (top >= cellOffset.top && top < cellOffset.top + 60 && left >= cellOffset.left && left < cellOffset.left + widget.dayWidth) {
				cell = $(this);
				return false;
			}
		});
		return cell;
	},
	addevent: function(data) {
		var $this = this;
		var cell = data.cell || this.getCellByDayAndHour(data.day, data.startHour);
		var offset = cell.offset();
		data.startMinutes = data.startMinutes || 0;
		var top = offset.top  + data.startMinutes;
		var eventElement = $('<div class="calendar-event ui-corner-all" />')
			.append('<div class="calendar-event-title">' + data.title + '</div>')
			.appendTo(this.element)
			.css({
				'background-color': data.color || '#f00',
				position: 'absolute',
				top: top + 'px',
				left: offset.left + 'px',
			})
			.width(100)
			.height(data.length * 60)
			.data({
				owningCell: cell,
				day: data.day,
				startHour: data.startHour,
				startMinutes: data.startMinutes,
				color: data.color,
				length: data.length
			})
			.draggable({
				grid: [this.dayWidth + 1, 15],
				handle: '.calendar-event-title',
				containment: this.innerCalendarTableBody,
				drag: function(event, ui) {
					if (ui.position.left < $this.hourHeaderWidth) {
						return false;
					}
					$this._clipEvent($(this));
				},
				stop: function(event, ui) {
					var cell = $this.getCellByOffset($(this).offset().top, $(this).offset().left);
					$(this).data('owningCell', cell);
					var minutes = $(this).offset().top - cell.offset().top;
					$(this).data('startMinutes', minutes);
				}
			})
			.resizable({
				handles: 's', grid: 15,
				stop: function(event, ui) {
					$(this).data('length', $(this).height() / 60);
				}
			})
			.dblclick(function (){
				$this._trigger('eventdoubleclick', null, {eventItem: this});
			});
	},
	_resizeCallback: function() {
		var widget = this;
		this.element.find('.calendar-event').each(function() {
			var cell = $(this).data('owningCell');
			var offset = cell.offset();
			if (offset.top > widget.calendarTableBody.offset().top + widget.calendarTableBody.height()) {
				$(this).hide();
			}
			else {
				$(this).show();
			}
			var data = $(this).data();
			var top = offset.top  + data.startMinutes
			$(this).css({
				top: top + 'px',
				left: offset.left + 'px'
			});
			widget._clipEvent($(this));
		});
	},
	_clipEvent: function(eventItem) {
		var widget = this;
		//var offset = eventItem.data('owningCell').offset();
		var offset = eventItem.offset();
		var width = eventItem.outerWidth() + 3;
		//var height = eventItem.outerHeight() + 3;
		var height = eventItem.data('length') * 60 + 3;
		eventItem.height(height - 3);
		$(eventItem).css('clip', '');
		if (offset.top < widget.calendarTableBody.offset().top) { // need to cut from the top
			var clipTop = widget.calendarTableBody.offset().top - offset.top;
			var clipBottom = widget.calendarTableBody.height() + height;
			$(eventItem).css('clip', 'rect(' + clipTop +'px, ' + width + 'px, ' + clipBottom + 'px, 0px)');
		}
		else if (offset.top + height > widget.calendarTableBody.offset().top + widget.calendarTableBody.height()) { // need to cut from the bottom
			var clipBottom = height - (offset.top + height - (widget.calendarTableBody.offset().top + widget.calendarTableBody.height()));
			$(eventItem).css('clip', 'rect(0px, ' + width + 'px, ' + clipBottom + 'px, 0px)');
			$(eventItem).height(clipBottom + 2);
		}
	}
});