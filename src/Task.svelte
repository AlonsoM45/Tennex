<script>
    export let name;
    export let levels;
    export let depth;

    if (!depth){
        depth = 0;
    }
</script>

<div class="task-card {depth % 2 == 0 ? 'even-depth-background' : 'odd-depth-background'}">
    <b class="task-title">{name}</b>
    <div class="task-space">
        {#if levels > 0}
    	    <svelte:self name={"Dummy task"} description={"Dummy description"} levels={levels-1} depth={depth + 1}/>
    	    <svelte:self name={"Dummy task"} description={"Dummy description"} levels={levels-1} depth={depth + 1}/>
        {/if}
    </div>
</div>

<style>
    .task-title {
        font-size: 14px;
    }

    .task-space {
        display: flex;
        flex-wrap: wrap;
    }

    .task-card {
        margin: 10px;
        padding: 5px;

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
        background-color: #1f202c;
    }

    .even-depth-background {
        background-color: #0d0d1a;
    }
</style>