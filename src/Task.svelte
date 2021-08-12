<script>
	import { allTasks, taskCount } from './stores.js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let id;

    $: name = $allTasks[id].name;
    $: children = $allTasks[id].children;
    $: isExpanded = $allTasks[id].isExpanded;
    $: isRemoved = $allTasks[id].isRemoved;
    $: isCompleted = $allTasks[id].isCompleted;
    $: isExpandable = children.filter(childId => {
        return !($allTasks[childId].isRemoved);
    }).length > 0;

    function toggleExpansion(){
        $allTasks[id].isExpanded = !isExpanded;
        // ToDo: Minimize children ?
    }

    function addTask(){
        let newTask = {
            id: $taskCount,
            name: "New Task",
            parent: id,
            children: [],
            isExpanded: true,
            isRemoved: false,
            isCompleted: false,
            details: "",
        };
        
        // Update global tasks
        taskCount.update(n => n + 1); // ToDo: Check synchronization issues
        $allTasks[id].children.push(newTask.id);
        $allTasks = [...$allTasks, newTask];

        // Update children
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
        // ToDo: Check that this is changed in the file
    }

    function removeTask(){
        $allTasks[id].isRemoved = true;
        // ToDo: Remove children
    }

    function toggleCompletion(){
        if ($allTasks[id].isCompleted){
            uncompleteTask(id);
        } else {
            completeTask(id);
        }
    }

    function completeTask(id){
        $allTasks[id].isCompleted = true;
        for (let childId of $allTasks[id].children){
            completeTask(childId);
        }
    }

    function uncompleteTask(id){
        $allTasks[id].isCompleted = false;
        if ($allTasks[id].parent != null){
            uncompleteTask($allTasks[id].parent);
        }      
    }
</script>

<!-- ToDo: Add possibility to "rescue" tasks (and permanently delete, also) -->
{#if !isRemoved}
<div class="task-card { isCompleted ? 'green-border' : 'violet-border' }">
    <div class="task-header { isCompleted ? 'green-background' : 'violet-background' }">
        {#if isExpandable} <!-- Hide expand/minimize if there are no tasks-->
            {#if isExpanded}
                <img class="task-header-button rotate-when-clicked" on:click={toggleExpansion} src="../assets/chevron-up-white.png" alt="Minimize Task"/>
            {:else}
                <img class="task-header-button rotate-when-clicked" on:click={toggleExpansion} src="../assets/chevron-down-white.png" alt="Expand Task"/>
            {/if}
        {:else}
            <img class="task-header-button skew-when-clicked" on:click={removeTask} src="../assets/cancel-white.png" alt="Remove Task"/>
        {/if}

        <img class="task-header-button skew-when-clicked" on:click={addTask} src="../assets/plus-white.png" alt="Add New Task"/>
        <img class="task-header-button skew-when-clicked" on:click={editTask} src="../assets/pencil-white.png" alt="Edit Task"/>
        <img class="task-header-button skew-when-clicked" on:click={toggleCompletion} src="../assets/check-white.png" alt="Complete Task"/>
        
        <b>{id}</b>
    </div>
    
    <input
        class="task-title purple-focus"
        value={name}
        on:input={changeName}
        onkeypress="this.style.width = (this.value.length + 2) + 'ch';"
    />

    {#if isExpanded}
        <div class="task-space">
            {#each children as childTaskId}
                <svelte:self id={childTaskId} on:editTask={forwardEditTask}/>
            {/each}
        </div>
    {/if}
</div>
{/if}

<style>
    .violet-background {
        background-color: #c567c5;
    }

    .green-background {
        background-color: #359e6a;
    }

    .task-header {
        display: flex;
        border-top-right-radius: 14px;
        width: 100%;
        min-height: 18px;
    }

    .task-title {
        margin: 10px;
        font-size: 14px;
        align-self: flex-start;
        min-width: 10ch;

        background-color: #2c2c2ed0;
        color: white;
        border: 0px;
        font-weight: bold;
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

    .violet-border {
        border: 1.5px solid #c567c5;
    }

    .green-border {
        border: 1.5px solid #359e6a;
    }

    .task-card {
        margin: 10px;
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;
        border-bottom-left-radius: 16px;

        min-height: 50px;
        height: min-content;

        min-width: 100px;

        display: inline-flex;
        flex-direction: column;
        padding-bottom: 5px;
        background-color: #2c2c2ed0;
    }
</style>