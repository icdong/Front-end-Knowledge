<!--
 * @Descripttion: 日历组件
 * @Author: c17015 chaichengdong
 * @Date: 2020-12-17 16:51:31
 * @LastEditors: Daito Chai
 * @LastEditTime: 2021-07-10 17:31:04
 * @LastEditContent: Do not Edit
-->
<template>
	<div id="Calendar">
		<div class="date-picker">
			<el-date-picker v-model="selectDate"
							value-format="yyyy-MM"
							type="month"
							:picker-options="pickerOptions"
							placeholder="选择月">
			</el-date-picker>
		</div>

		<div class="week-display flex">
			<div v-for="item in week"
				 :key="item.value"
				 class="week-cell">{{item.value}}</div>
		</div>
		<div class="day-flex">
			<div v-for="item in days"
				 :key="item.day"
				 class="date-cell"
				 :class="{'not-allowed': !item.day || isFuture(item.day)}"
				 @click="setActive(item)">
				<div :class="{'today-selected': activeDay.includes(item.date) }">
					<p>
						{{item.day}}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	export default {
		name: 'Calendar',
		components: {

		},
		props: {

		},
		data() {
			return {
				selectDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
					}
				},
				week: [
					{ 'value': '周日', }, { 'value': '周一', }, { 'value': '周二', },
					{ 'value': '周三', }, { 'value': '周四', }, { 'value': '周五', },
					{ 'value': '周六', }
				],
				days: [],
				activeFlag: 'frist',
				activeDay: [],
				choose: [],
			}
		},
		created() {
			let date = new Date(), year = date.getFullYear(), month = date.getMonth() + 1
			this.days = [...this.emptyGridsArray(year, month), ...this.calDays(year, month)]
			for (let i = 0; i < 7; i++) {
				this.activeDay.push(this.getDay(-i))
			}
		},
		mounted() {

		},
		activated() {

		},
		updated() {

		},
		// beforeRouteEnter(to, from, next) {
		//
		// },
		methods: {
			calEmptyGrid: (y, m) => new Date(`${y}/${m}/01 00:00:00`).getUTCDay(),
			isLeapYear: y => y % 400 == 0 || (y % 4 == 0 && y % 100 != 0),
			calDaysInMonth(year, month) {
				let leapYear = this.isLeapYear(year)
				if (month == 2 && leapYear) {
					return 29
				}
				if (month == 2 && !leapYear) {
					return 28
				}
				if ([4, 6, 9, 11].includes(month)) {
					return 30
				}
				return 31
			},
			calDays(y, m) {
				let selectDate = this.selectDate.replace('-', '')
				let days = []
				for (let i = 1; i <= 31; i++) {
					days.push({
						day: i,
						date: i < 10 ? `${selectDate}0${i}` : `${selectDate}${i}`
					})
				}
				return days.slice(0, this.calDaysInMonth(y, m))
			},
			emptyGridsArray(year, month) {
				let emptyGrids = this.calEmptyGrid(year, month)
				return emptyGrids > 5 ? [] : Array(emptyGrids + 1).fill({ day: null })
			},
			// 判断是否是本月未来几天
			isFuture(day) {
				let date = new Date(), year = date.getFullYear(), month = date.getMonth() + 1, days = date.getDate()
				if (this.selectDate.split('-')[0] == year && this.selectDate.split('-')[1] == month && days < day) {
					return true
				} else {
					return false
				}
			},
			getDay(day, date = { yyyy: new Date().getFullYear(), mm: new Date().getMonth(), dd: new Date().getDate() }) {
				let today = new Date(date.yyyy, date.mm, date.dd)
				let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day
				today.setTime(targetday_milliseconds)
				let tYear = today.getFullYear()
				let tMonth = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1
				let tDate = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate()
				return `${tYear}${tMonth}${tDate}`
			},
			// 选中时间范围
			setActive(item) {
				if (item.day === null || this.isFuture(item.day)) return

				// 第一次点击
				if (this.activeFlag === 'frist' || !this.choose.includes(item.date)) {
					this.activeDay = [item.date]
					this.activeFlag = 'second'

					let obj = {
						yyyy: Number(this.selectDate.split('-')[0]),
						mm: Number(this.selectDate.split('-')[1] - 1),
						dd: item.day,
					}
					this.choose = [item.date]
					for (let i = 1; i < 7; i++) {
						this.choose.push(this.getDay(-i, obj))
						this.choose.push(this.getDay(i, obj))
					}
					this.choose.sort((a, b) => a - b)
					return
				}

				if (this.choose.includes(item.date)) {
					// 只选中一个时
					if (this.activeDay.length === 1) {
						if (item.date < this.activeDay[0]) {
							let start = this.choose.indexOf(item.date)
							let end = this.choose.indexOf(this.activeDay[0])
							this.activeDay = this.choose.slice(start, end + 1)
						} else {
							let start = this.choose.indexOf(item.date)
							let end = this.choose.indexOf(this.activeDay[0])
							this.activeDay = this.choose.slice(end, start + 1)
						}

						let num = 7 - this.activeDay.length
						let start = this.choose.indexOf(this.activeDay[0])
						let end = this.choose.indexOf(this.activeDay[this.activeDay.length - 1])
						this.choose = this.choose.slice(start - num, end + num + 1)
					} else {
						// 包含在所选中
						if (this.activeDay.includes(item.date)) {
							let index = this.activeDay.indexOf(item.date)
							this.activeDay = this.activeDay.slice(0, index + 1)
							this.choose = []
						} else {
							let index = this.choose.indexOf(item.date)

							let start = this.choose.indexOf(this.activeDay[0])
							let end = this.choose.indexOf(this.activeDay[this.activeDay.length - 1])
							// 在序列右边
							if (end < index) {
								this.activeDay = this.choose.slice(start, index + 1)
							} else {
								this.activeDay = this.choose.slice(index, end + 1)
							}

							let num = 7 - this.activeDay.length
							let start1 = this.choose.indexOf(this.activeDay[0])
							let end1 = this.choose.indexOf(this.activeDay[this.activeDay.length - 1])
							this.choose = this.choose.slice(start1 - num, end1 + num + 1)
						}
					}
				}
			},
		},
		filters: {

		},
		computed: {

		},
		watch: {
			selectDate: {
				handler() {
					let year = Number(this.selectDate.split('-')[0]), month = Number(this.selectDate.split('-')[1])
					this.days = [...this.emptyGridsArray(year, month), ...this.calDays(year, month)]
					// this.activeDay = new Date().getMonth() + 1 == month ? new Date().getDate() : ''
				},
			},
			activeDay: {
				handler() {
					let array = [...this.activeDay]
					this.$emit('dateChange', array.sort((a, b) => a - b))
				}
			},
		},
		beforeMount() {

		},
	}
</script>
<style lang="less" scoped>
	#Calendar {
		margin-bottom: 10px;
		width: 100%;
		min-width: 370px;
		.flex {
			display: -webkit-flex;
			display: flex;
			-webkit-flex-wrap: wrap;
			flex-wrap: wrap;
		}
		.date-picker {
			width: 100%;
			height: 30px;
			text-align: center;
			background: #2f547e;
		}
		/deep/ .el-input .el-input__inner {
			border-radius: 0;
		}
		.week-display {
			width: 100%;
			height: 25px;
			line-height: 25px;
			margin: 4px 0;
			box-sizing: border-box;
			.week-cell {
				margin-left: 4px;
				flex: 1;
				text-align: center;
				background: #3a4961;
			}
			.week-cell:first-child {
				margin-left: 0;
			}
			.week-cell:last-child {
				margin-right: 0;
			}
		}
		.day-flex {
			display: -webkit-flex;
			display: flex;
			-webkit-flex-wrap: wrap;
			flex-wrap: wrap;
		}
		.date-cell {
			margin-left: 4px;
			margin-top: 2px;
			margin-bottom: 2px;
			flex: 1;
			width: 13.36%;
			min-width: 13.36%;
			max-width: 13.65%;
			height: 30px;
			line-height: 30px;
			color: #b5b9c9;
			text-align: center;
			background: #0a335f;
			cursor: pointer;
		}
		.date-cell:nth-child(7n + 1) {
			margin-left: 0;
		}
		.not-allowed {
			cursor: no-drop;
		}
		.today-selected {
			margin: 0 auto;
			width: 100%;
			height: 100%;
			background-color: #30486a;
		}
	}
</style>