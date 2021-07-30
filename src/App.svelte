<script>
	import Task from './Task.svelte';
</script>

<div id="app-container">
	<Task name={"Dummy task"} description={"Dummy description"} hasChild={true}/>
</div>

<style>
	#app-container {
		width: 100%;
		height: 100%;
		background-color: #1b101b;
		
		display: flex;
		flex-wrap: wrap;
	}
</style>
