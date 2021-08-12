<script>
    import { createEventDispatcher } from 'svelte';
    import { allTasks } from './stores';
    
    const dispatch = createEventDispatcher();
    
    export let taskId;

    $: selectedTask = $allTasks[taskId];
    
    function hidePanel(){
		dispatch('hide', {});
    }

    function changeDetails(event){
        $allTasks[taskId].details = event.target.value;
        // ToDo: Check that this is changed in the file [LOW PRIORITY]
    }
</script>

<div class="panel">
    <div class="panel-header">
        <img class="panel-header-button" on:click={hidePanel} src="../assets/chevron-up-white.png" alt="Hide Panel"/>
        
        <b>Editing Task #{taskId} : {selectedTask.name}</b>
    </div>

    <textarea class="purple-focus" on:input={changeDetails} value={selectedTask.details} placeholder="details" />
</div>

<style>
    textarea {
        margin: 20px;
        background-color: #2c2c2e;
        color: white;
    }

    .panel {
        height: 100%;
        width: 100%;
        border-bottom: 4px solid #c567c5;
        background-color: #0d0d1a;
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