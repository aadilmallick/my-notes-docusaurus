
## Cron Scheduling

By listening to the `schedule` workflow trigger, you can pass in a cron event so that your github action runs jobs repeatedly based on a schedule.

```yaml
name: run every day

on:
	schedule: 
		- cron: '0 0 * * *'
```