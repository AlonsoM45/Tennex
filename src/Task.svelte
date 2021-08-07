<script>
    export let name;
    export let depth;
    export let minimizedByParent;

    let isExpanded = true;
    let shouldMinimizeChildren = false;
    let tasks = [];
    if (!depth){
        depth = 0;
    }

    function toggleExpansion(){
        isExpanded = !isExpanded;
    }

    function toggleChildrenMinimization(){
        shouldMinimizeChildren = !shouldMinimizeChildren;
    }

    function addTask(){
        tasks.push("New Task");
        tasks = tasks;
    }
</script>

<div class="task-card {depth % 2 == 0 ? 'even-depth-background' : 'odd-depth-background'}">
    <div class="task-header">
        {#if !minimizedByParent}
        <div class="task-header-button" on:click={toggleExpansion}>
            {#if isExpanded}
            - <!-- ToDo: Fix this hideous "minus" and "plus" symbols -->
            {:else}
            +
            {/if}
        </div>

            <!-- ToDo: Better UX for minimization, etc... -->
            {#if isExpanded && !minimizedByParent}
            <div class="task-header-button" on:click={toggleChildrenMinimization}>
                {#if shouldMinimizeChildren}
                - <!-- ToDo: Fix this hideous "minus" and "plus" symbols -->
                {:else}
                +
                {/if}
            </div>
            {/if}
        {/if}
    </div>
    <b class="task-title">{name}</b>
    {#if isExpanded && !minimizedByParent}
    <div class="task-space">
        {#each tasks as task}
    	    <svelte:self name={task} depth={depth + 1} minimizedByParent={shouldMinimizeChildren}/>
        {/each}
    </div>

    <div class="actions-space">
        <button class="add-task-button" on:click={addTask}>
            +
        </button>
    </div>
    {/if}
</div>

<style>
    .task-header {
        display: flex;
        border-top-right-radius: 16px;
        width: 100%;
        background-color: #864786;
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

        margin: 2px;
        width: 14px;
        height: 14px;
        border-radius: 7px;
        background-color: white;
        font-size: 18px;

        display: flex;
        justify-content: center;
        align-items: center;
        color: #864786;
    }

    .task-space {
        display: flex;
        flex-wrap: wrap;
    }

    .actions-space {
        display: flex;
        justify-content: flex-end;
        width: 90%;
        margin: 5px 5%;
    }

    .add-task-button {
        cursor: pointer;
        border: 1px solid #864786;
        width: 22px;
        height: 22px;
        font-size: 20px;
        padding: 0px;
    }

    .task-card {
        display: flex;
        justify-content: center;
        align-items: center;

        margin: 10px;
        border: 1.5px solid #864786;
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;
        border-bottom-left-radius: 16px;

        min-height: 50px;
        height: min-content;

        min-width: 100px;

        display: inline-flex;
        flex-direction: column;
    }

    .odd-depth-background {
        background-color: rgb(44, 44, 46)
    }

    .even-depth-background {
        background-color: #0d0d1a;
    }
</style>