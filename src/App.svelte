<script>
	import TopPanel from './TopPanel.svelte';
	import Task from './Task.svelte';
	import { allTasks } from './stores';

	let isTopPanelOpen = false;
	let selectedTaskId = 0;

	let firstTask = {
		id: 0,
		name: "First Task",
		children: [],
		isExpanded: true,
	};

	allTasks.set([firstTask]);
	
	function openTaskDetails(event){
		selectedTaskId = event.detail.id;
		isTopPanelOpen = true;
	}

	function closeTaskDetails(){
		selectedTaskId = 0;
		isTopPanelOpen = false;
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
