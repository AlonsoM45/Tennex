<script>
	import { expand } from './transitions';
	import TopPanel from './TopPanel.svelte';
	import Task from './Task.svelte';
	import { allTasks, taskCount } from './stores';
	const {app} = require('electron').remote; // ToDo: This is suppossed to be unsafe, maybe do it with IPC
	const fs = window.require('fs');

	let tasksFilename = app.getPath('userData') + "/tasks.json";
	let oldTasksFilename = app.getPath('userData') + "/old-tasks.json";
	let isTopPanelOpen = false;
	let selectedTaskId = 0;
	let dataHasChanged = false;

	let firstTask = {
		id: 0,
		name: "First Task",
		children: [],
		isExpanded: true,
		isRemoved: false,
		isCompleted: false,
		isBlocked: false,
		details: "",
	};

	$allTasks = [firstTask];

	function openTaskDetails(event){
		selectedTaskId = event.detail.id;
		isTopPanelOpen = true;
	}

	function closeTaskDetails(){
		selectedTaskId = 0;
		isTopPanelOpen = false;
	}

	fs.readFile(tasksFilename, 'utf-8', (err, data) => {
		if (err){
			console.log(err);
			alert("An error ocurred reading the file :" + err.message);
		} else {
			try{
				let allData = JSON.parse(data);
				taskCount.set(allData.length);
				allTasks.set(allData);
				console.log("Assigned:", allData);
				fs.writeFileSync(oldTasksFilename, JSON.stringify(allData));
			}catch(error){
				console.log("Error while parsing tasks:" + error);
			}
		}
		
		const unsuscribeToAllTasks = allTasks.subscribe(tasksArray => {
			dataHasChanged = true;
		});
	});	

	function writeAllTasks(){
		let tasksArray = $allTasks; 
		try {
			fs.writeFileSync(tasksFilename, JSON.stringify(tasksArray));
			dataHasChanged = false;
			console.log("Writing...");
		} catch(e){
			console.log(e);
			alert('Failed to save the file!');
		}
	}

	function writeAllTasksIfNeeded(){
		if (dataHasChanged){
			writeAllTasks();
		}
	}

	setInterval(writeAllTasksIfNeeded, 10000);
</script>

{#if isTopPanelOpen}
	<div style="height: 200px;" in:expand={{totalHeight: 200}} out:expand={{totalHeight: 200}}>
		<TopPanel isOpen={isTopPanelOpen} taskId={selectedTaskId} on:hide={closeTaskDetails}/>
	</div>
{/if}

<div class="task-panel">
	<Task id={0} on:editTask={openTaskDetails}/>
</div>

<style>
	.task-panel {
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;
	}
</style>
