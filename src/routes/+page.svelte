<script>
    import { TextInput, FileUploader, Tile, Accordion, AccordionItem, Button, ButtonSet, Loading, InlineLoading, ImageLoader, Link } from "carbon-components-svelte";
    import { schedule_data as schedule_data_glob } from '../stores/store'
    let image = ""
    let generatedImage = ""
    let isLoaded = false
    let isUploaded = false
    let isWaitingWallpaper = false
    let schedule_data 
    schedule_data_glob.subscribe(val => {
        isLoaded = true
        schedule_data = JSON.parse(val)
    })
    let update_schedule = () => {
        schedule_data_glob.set(JSON.stringify(schedule_data))
    }
    $: console.log(isWaitingWallpaper)
</script>
<svelte:head>
    <title>Shedule project</title>
</svelte:head>
<div class="container">
    <h1>Генератор обоев с расписанием</h1>
    {#if isLoaded == true}
    <Tile>
        <FileUploader
            labelTitle="Обои для наложения расписания"
            buttonLabel="Загрузить изображение"
            labelDescription="Только .jpeg и .png изображения"
            accept={[".jpg", ".jpeg", ".png"]}
            on:add={(e) => {
                let reader = new FileReader();
                reader.readAsDataURL(e.detail[0])
                reader.onload = e => {
                    image = e.target.result.split(',')[1]
                    isUploaded = true
                }
            }}
            status={isUploaded ? "complete" : "uploading"}
        />
    </Tile>
    <Tile>
        <div class="settings">
            <h3>Настройки расписания</h3>
            {#each schedule_data.schedule as day, i}
                <Tile light>
                    <div class="day">
                    <TextInput inline labelText="Название дня" placeholder="Введите название дня"
                        type="string" bind:value={schedule_data.schedule[i].name} on:change={() => update_schedule()}/>
                    {#if day.lessons.length !== 0}
                        <h4>Уроки/пары</h4>
                    {/if}
                    {#each day.lessons as lesson, j}
                        {#if lesson.name !== undefined}
                        <div>
                            <TextInput inline labelText="Название предмета" placeholder="Введите название предмета"
                                type="string" bind:value={schedule_data.schedule[i].lessons[j].name} on:change={() => update_schedule()}/>
                            <TextInput inline labelText="Кабинет" placeholder="Введите номер/название кабинета"
                                type="string" bind:value={schedule_data.schedule[i].lessons[j].room} on:change={() => update_schedule()}/>
                        </div>
                        {:else}
                        <div>
                            <h5>Окно</h5>
                        </div>
                        {/if}
                        <Button on:click={() => {
                            schedule_data.schedule[i].lessons.splice(j, 1)
                            update_schedule()
                        }} kind="danger" size="sm">Удалить урок</Button>
                    {/each}
                    <ButtonSet>
                        <Button on:click={() => {
                            schedule_data.schedule[i].lessons.push({name: "", room: ""})
                            update_schedule()
                        }}>Добавить урок</Button>
                        <Button on:click={() => {
                            schedule_data.schedule[i].lessons.push({})
                            update_schedule()
                        }}>Добавить окно</Button>
                        <Button on:click={() => {
                            schedule_data.schedule.splice(i, 1)
                            update_schedule()
                        }} kind="danger">Удалить день</Button>
                    </ButtonSet>
                    </div>
                </Tile>
            {/each}
            <Button on:click={() => {
                schedule_data.schedule.push({name: "", lessons: []})
                update_schedule()
            }}>Добавить день</Button>
            <Accordion>
                <AccordionItem title="Специальные параметры">
                    <TextInput inline labelText="Высота расписания (пиксели)" placeholder="Enter user name..."
                        type="number" bind:value={schedule_data.size_info.height} on:change={() => update_schedule()}/>
                    <TextInput inline labelText="Отступ слева (пиксели)" placeholder="Enter user name..."
                        type="number" bind:value={schedule_data.size_info.padding_left} on:change={() => update_schedule()}/>
                    <TextInput inline labelText="Отступ сверху (пиксели)" placeholder="Enter user name..."
                        type="number" bind:value={schedule_data.size_info.padding_top} on:change={() => update_schedule()}/>
                    <TextInput inline labelText="Высота конечного изображения (пиксели)" placeholder="Enter user name..."
                        type="number" bind:value={schedule_data.size_info.output_height} on:change={() => update_schedule()}/>
                    <TextInput inline labelText="Ширина конечного изображения (пиксели)" placeholder="Enter user name..."
                        type="number" bind:value={schedule_data.size_info.output_width} on:change={() => update_schedule()}/>
                </AccordionItem>
            </Accordion>
        </div>
    </Tile>
    <Tile>
        <h3>Сгенерировать обои</h3>
        <ButtonSet>
        {#if isWaitingWallpaper == false}
        <Button on:click={async () => {
            isWaitingWallpaper = true
            fetch('https://bqkk4l.deta.dev/wall', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"wall_image": image, "schedule_data": schedule_data})
            }).then(res => res.json()).then(res => generatedImage = res.wall).then(() => isWaitingWallpaper = false)
        }}>Сгенерировать</Button>
        {#if generatedImage !== ""}
        <Button download="wallpaper.jpeg" href={"data:image/jpeg;base64,"+generatedImage} kind="secondary">
            Скачать
        </Button>
        {/if}
        {:else}
        <InlineLoading description="Генерируем..."/>
        {/if}
        </ButtonSet>
        <ImageLoader src={"data:image/jpeg;base64,"+generatedImage}/>
    </Tile>
    {:else}
    <Loading withOverlay={false}/>
    {/if}
</div>

<style>
.container {
    padding-top: 10px;
    width: 70%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.settings {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.day {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>