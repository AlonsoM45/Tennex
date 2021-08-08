<script>
	import { allTasks, taskCount } from './stores.js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let id;
    export let depth;

    $: name = $allTasks[id].name;
    $: children = $allTasks[id].children;
    $: isExpanded = $allTasks[id].isExpanded;

    if (!depth){
        depth = 0;
    }

    function toggleExpansion(){
        $allTasks[id].isExpanded = !isExpanded;
    }

    function addTask(){
        let newTask = {
            id: $taskCount,
            name: "New Task",
            children: [],
            isExpanded: true,
            details: "",
        };
        
        // Update global tasks
        taskCount.update(n => n + 1); // ToDo: Check synchronization issues
        $allTasks = [...$allTasks, newTask];

        // Update children
        $allTasks[id].children.push(newTask.id);
        isExpanded = true;
    }

    function editTask(){
		dispatch('editTask', {
			id: id
		});
    }

    function forwardEditTask(editTaskEvent) {
		dispatch('editTask', editTaskEvent.detail);
	}

    function changeName(event){
        $allTasks[id].name = event.target.value;
    }
</script>

<!-- ToDo: Add possibility to "delete" and "rescue" tasks (and permanently delete, also) -->
<div class="task-card {depth % 2 == 0 ? 'even-depth-background' : 'odd-depth-background'}">
    <div class="task-header">
        {#if children.length > 0} <!-- Hide expand/minimize if there are no tasks-->
            {#if isExpanded}
                <img class="task-header-button rotate-when-clicked" on:click={toggleExpansion} src="../assets/chevron-up-white.png" alt="Minimize Task"/>
            {:else}
                <img class="task-header-button rotate-when-clicked" on:click={toggleExpansion} src="../assets/chevron-down-white.png" alt="Expand Task"/>
            {/if}
        {/if}

        <img class="task-header-button skew-when-clicked" on:click={addTask} src="../assets/plus-white.png" alt="Add New Task"/>
        <img class="task-header-button skew-when-clicked" on:click={editTask} src="../assets/pencil-white.png" alt="Edit Task"/>
        <b>{id}</b> <!-- ToDo: Remove this-->
    </div>
    
    <!-- ToDo: Make this (and other fields) editable -->
    <input
        class="task-title {depth % 2 == 0 ? 'odd-depth-background' : 'even-depth-background'}"
        value={name}
        on:input={changeName}
        onkeypress="this.style.width = (this.value.length + 2) + 'ch';"
    />

    {#if isExpanded}
        <div class="task-space">
            {#each children as childTaskId}
                <!-- ToDo: Minimized by parent should be replaced with a call to something that changes "isMinimized" inside the child-->
                <svelte:self id={childTaskId} depth={depth + 1} on:editTask={forwardEditTask}/>
            {/each}
        </div>
    {/if}
</div>

<style>
    .task-header {
        display: flex;
        border-top-right-radius: 14px;
        width: 100%;
        background-color: #c567c5;
        min-height: 18px;
    }

    .task-title {
        margin: 10px;
        font-size: 14px;
        align-self: flex-start;
        min-width: 10ch;

        color: white;
        border: 0px;
        font-weight: bold;
    }

    .task-title:focus {
        box-shadow: 0 0 4px #c567c5;
        border: 1px solid #c567c5;
        box-sizing: border-box;
        outline: none;
    }

    .task-header-button {
        cursor: pointer;
        margin: 4px;
        width: 16px;
        height: 16px;
    }

    .rotate-when-clicked:active {
        transform: rotate(90deg); /* ToDo: Check if I can make this rotate faster */
    }

    .skew-when-clicked:active {
        transform: skew(10deg, 5deg);
    }

    .task-space {
        display: flex;
        flex-wrap: wrap;
    }

    .task-card {
        margin: 10px;
        border: 1.5px solid #c567c5;
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;
        border-bottom-left-radius: 16px;

        min-height: 50px;
        height: min-content;

        min-width: 100px;

        display: inline-flex;
        flex-direction: column;
        padding-bottom: 5px;
    }

    .odd-depth-background {
        background-color: #2c2c2e
    }

    .even-depth-background {
        background-color: #0d0d1a;
    }
</style>