<script>
    export let name;
    export let depth;

    let isExpanded = true;
    let tasks = [];
    if (!depth){
        depth = 0;
    }

    function toggleExpansion(){
        isExpanded = !isExpanded;
    }

    function addTask(){
        tasks.push("New Task");
        tasks = tasks;
        isExpanded = true;
    }
</script>

<div class="task-card {depth % 2 == 0 ? 'even-depth-background' : 'odd-depth-background'}">
    <div class="task-header">
        {#if tasks.length > 0} <!-- Hide expand/minimize if there are no tasks-->
            {#if isExpanded}
                <img class="task-header-button" on:click={toggleExpansion} src="../assets/chevron-up-white.png" alt="Minimize"/>
            {:else}
                <img class="task-header-button" on:click={toggleExpansion} src="../assets/chevron-down-white.png" alt="Expand"/>
            {/if}
        {/if}

        <img class="task-header-button" on:click={addTask} src="../assets/plus-white.png" alt="Add New Task"/>
    </div>
    

    <!-- ToDo: Make this (and other fields) editable -->
    <b class="task-title">{name}</b>
    
    {#if isExpanded}
        <div class="task-space">
            {#each tasks as task}
                <!-- ToDo: Minimized by parent should be replaced with a call to something that changes "isMinimized" inside the child-->
                <svelte:self name={task} depth={depth + 1} />
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
        margin: 5px;
        margin-bottom: 0px;
        font-size: 14px;
        align-self: flex-start;
    }

    .task-header-button {
        cursor: pointer;
        margin: 4px;
        width: 16px;
        height: 16px;
    }

    .task-header-button:active {
        transform: rotate(90deg); /* ToDo: Check if I can make this rotate faster */
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
        background-color: rgb(44, 44, 46)
    }

    .even-depth-background {
        background-color: #0d0d1a;
    }
</style>