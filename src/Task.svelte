<script>
	import { allTasks, taskCount, selectedTaskId } from './stores.js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let id;

    $: name = $allTasks[id].name;
    $: children = $allTasks[id].children;
    $: isExpanded = $allTasks[id].isExpanded;
    $: isRemoved = $allTasks[id].isRemoved;
    $: isCompleted = $allTasks[id].isCompleted;
    $: isBlocked = $allTasks[id].isBlocked;

    $: isExpandable = children.filter(childId => {
        return !($allTasks[childId].isRemoved);
    }).length > 0;
    $: isSelected = $selectedTaskId == id;

    function toggleExpansion(){
        $allTasks[id].isExpanded = !isExpanded;
        // ToDo: Minimize children [LOW PRIORITY]
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
            isBlocked: false,
            details: "",
        };
        
        // Update global tasks
        taskCount.update(n => n + 1); // ToDo: Check synchronization issues [LOW PRIORITY]
        $allTasks[id].children.push(newTask.id);
        $allTasks = [...$allTasks, newTask];

        // Update children
        isExpanded = true;
        
        // Un-complete if necessary
        if (isCompleted){
            uncompleteTask(id);
        }
    }

    function editTask(){
        $selectedTaskId = id;
		dispatch('editTask', {
			id: id
		});
    }

    function forwardEditTask(editTaskEvent) {
		dispatch('editTask', editTaskEvent.detail);
	}

    function changeName(event){
        $allTasks[id].name = event.target.value;
        // ToDo: Check that this is changed in the file [LOW PRIORITY]
    }

    function removeTask(){
        $allTasks[id].isRemoved = true;
    }

    function toggleLockStatus(){
        if (isBlocked){
            unblockTask(id);
        }else{
            blockTask(id);
        }
    }

    function blockTask(id){
        $allTasks[id].isBlocked = true;
        for (let childId of $allTasks[id].children){
            blockTask(childId);
        }
    }

    function unblockTask(id){
        $allTasks[id].isBlocked = false;
    }

    function toggleCompletion(){
        if (isCompleted){
            uncompleteTask(id);
        } else {
            completeTask(id);
        }
    }

    function completeTask(id){
        $allTasks[id].isCompleted = true;
        $allTasks[id].isBlocked = false;
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

    function handleDragDrop(e) {
        e.preventDefault();
        let elementId = e.dataTransfer.getData("task-id");
        let droppedTaskId = parseInt(elementId.substring(10, elementId.length)); // 10 is the length of "task-card-"
        if (id != droppedTaskId){
            // Add new children
            $allTasks[id].children.push(droppedTaskId);  
              
            // Remove old children
            let parentId = $allTasks[droppedTaskId].parent;
            $allTasks[parentId].children.splice($allTasks[parentId].children.indexOf(droppedTaskId), 1)

            // Re-assign children to force update
            $allTasks[id].children = $allTasks[id].children;
            $allTasks[parentId].children = $allTasks[parentId].children;

            // Change parent
            $allTasks[droppedTaskId].parent = id;
        }
    }
	
    function handleDragStart(e) {
        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("task-id", e.target.getAttribute('id'));
    }
</script>

<!-- ToDo: Add possibility to "rescue" tasks (and permanently delete, also) [LOW PRIORITY] -->
{#if !isRemoved}
<div
    id="task-card-{id}"
    class="task-card { isSelected ? 'violet-border' : (isCompleted ? 'green-border' : (isBlocked ? 'red-border' : 'neutral-border'))}"
    draggable="true"
    on:dragstart={handleDragStart}
    on:drop|stopPropagation={handleDragDrop} 
	ondragover="return false"
>
    <div class="task-header { isSelected ? 'violet-background' : (isCompleted ? 'green-background' : (isBlocked ? 'red-background' : 'neutral-background')) }">
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
        
        {#if !isCompleted}
            <img class="task-header-button skew-when-clicked" on:click={toggleLockStatus} src="../assets/padlock-white.png" alt="Lock/Unlock Task"/>
        {/if}

        <img class="task-header-button skew-when-clicked" on:click={toggleCompletion} src="../assets/check-white.png" alt="Toggle Task Completion"/>
        
        <b>{id}</b>
    </div>
    
    <input
        class="task-title purple-focus"
        style={"width:"+ ((name.length + 2) + 'ch;')}
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
    /*
    ToDo: Use this colors and aqua
    .sky-background {
        background-color: #32dbdb;
    }
    */

    .red-background {
        background-color: #b92840;
    }

    .violet-background {
        background-color: #c567c5;
    }

    .neutral-background {
        background-color: #5e486b;
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
        transform: rotate(90deg); /* ToDo: Check if I can make this rotate faster [LOW PRIORITY]*/
    }

    .skew-when-clicked:active {
        transform: skew(10deg, 5deg);
    }

    .task-space {
        display: flex;
        flex-wrap: wrap;
    }

    /*
    ToDo: Use this colors and aqua
    .sky-border {
        border: 1.5px solid #32dbdb;
    }
    */

    .red-border {
        border: 1.5px solid #b92840;
    }

    .violet-border {
        border: 1.5px solid #c567c5;
    }

    .neutral-border {
        border: 1.5px solid #5e486b;
    }

    .green-border {
        border: 1.5px solid #359e6a; /* ToDo: Maybe use #28b99a; */
    }

    .task-card {
        position: relative;
        margin: 10px;
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;
        border-bottom-left-radius: 16px;

        min-height: 50px;
        height: min-content;

        min-width: 150px;

        display: inline-flex;
        flex-direction: column;
        padding-bottom: 5px;
        background-color: #2c2c2ed0;
    }
</style>