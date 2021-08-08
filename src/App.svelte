<script>
	import TopPanel from './TopPanel.svelte';
	import Task from './Task.svelte';
	import { allTasks, taskCount } from './stores';
	const {app} = require('electron').remote; // ToDo: This is suppossed to be unsafe, maybe do it with IPC
	const fs = window.require('fs');

	let tasksFilename = app.getPath('userData') + "/tasks.txt";
	let oldTasksFilename = app.getPath('userData') + "/old-tasks.txt";
	let isTopPanelOpen = false;
	let selectedTaskId = 0;

	let firstTask = {
		id: 0,
		name: "First Task",
		children: [],
		isExpanded: true,
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
		if(err){
			console.log(err);
			alert("An error ocurred reading the file :" + err.message);
		}else{
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
			writeAllTasks(tasksArray);
		});
	});	

	function writeAllTasks(tasksArray){
		try {
			fs.writeFileSync(tasksFilename, JSON.stringify(tasksArray));
			console.log("Writing...");
		} catch(e){
			console.log(e);
			alert('Failed to save the file!');
		}
	}
</script>

{#if isTopPanelOpen}
	<TopPanel taskId={selectedTaskId} on:hide={closeTaskDetails}/>
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
