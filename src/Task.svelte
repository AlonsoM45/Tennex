<script>
    export let name;
    export let levels;
</script>

<div class="task-card">
    <b class="task-title">{name}</b>
    <div class="task-space">
        {#if levels > 0}
    	    <svelte:self name={"Dummy task"} description={"Dummy description"} levels={levels-1}/>
    	    <svelte:self name={"Dummy task"} description={"Dummy description"} levels={levels-1}/>
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
        margin: 15px;
        padding: 15px;

        border: 2px solid #864786;
        border-radius: 10px;

        min-height: 50px;
        min-width: 100px;

        background-color: #241e30;

        display: flex;
        flex-direction: column;
    }
</style>