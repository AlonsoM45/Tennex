<script>
    import { createEventDispatcher } from 'svelte';
import { allTasks } from './stores';
    
    const dispatch = createEventDispatcher();
    
    export let taskId;

    $: selectedTask = $allTasks[taskId];
    function hidePanel(){
		dispatch('hide', {});
    }
</script>

<div class="panel">
    <div class="panel-header">
        <img class="panel-header-button" on:click={hidePanel} src="../assets/chevron-up-white.png" alt="Hide Panel"/>
        
        <b>Editing Task #{taskId} : {selectedTask.name}</b>
    </div>
</div>

<style>
    .panel {
        height: 200px;
        width: 100%;
        border-bottom: 4px solid #c567c5;
    }

    .panel-header {
        display: flex;
        width: 100%;
        background-color: #c567c5;
        min-height: 18px;
    }

    .panel-header-button {
        cursor: pointer;
        margin: 4px;
        width: 16px;
        height: 16px;
    }
</style>