<script>
    export let name;
    export let description;
    export let hasChild;
</script>

<div class="task-card">
    <b class="task-title">{name}</b>
    <p class="task-body">{description}</p>
    <div class="task-space">
        {#if hasChild}
    	    <svelte:self name={"Dummy task"} description={"Dummy description"} hasChild={false}/>
        {/if}
    </div>
</div>

<style>
    .task-title {
        width: 100%;
        border-bottom: 2px solid #b2e4d1;
        padding-bottom: 3px;
    }

    .task-body {
        margin-top: 10px;
    }

    .task-card {
        margin: 15px;
        padding: 15px;

        border: 2px solid #864786;
        border-radius: 10px;

        min-height: 100px;
        max-height: 150px;
        min-width: 300px;

        background-color: #241e30;

        display: flex;
        flex-direction: column;
    }

    * {
        color: #b2e4d1;
    }
</style>