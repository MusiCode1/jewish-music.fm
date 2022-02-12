<script lang="ts">
	import { progress_val, progress_max, opacity, visibility } from "./globals";
	import { close } from "./close";
</script>

<div id="window" style="visibility:{$visibility}; opacity: {$opacity};">
	<div id="bar">
		<div id="window-text">הורדה מאתר Jewish-music.Fm</div>
		<div id="close" on:click={close} />
	</div>

	<div id="window-content">
		<progress value={$progress_val} max={$progress_max} />

		<div id="text" />
		<div id="credit">
			<a href="https://github.com/MusiCode1/jewish-music.fm" target="_">
				<em>MusiCode</em>
			</a>
		</div>
	</div>
</div>

<style>
	#window {
		position: fixed;
		left: 10%;
		right: 10%;
		top: 20%;
		bottom: 20%;
		max-width: 660px;
		margin: auto;

		backdrop-filter: blur(8px);
		border-radius: 30px;
		background: rgba(255, 255, 255, 0.73);
		box-shadow: 0px 0px 13px 1px;

		transition: all 3s ease-out;
		z-index: 20;
	}

	#bar {
		position: absolute;
		height: 50px;
		left: 0;
		right: 0;

		background: #7c7c7c;
		border-radius: 30px 30px 0px 0px;
	}

	#window-text {
		height: 100%;

		display: flex;
		align-items: center;
		justify-content: space-around;
		text-align: center;

		font-size: 24px;
		line-height: 28px;
		color: #ececec;

		font-family: system-ui;

		position: relative;
		width: calc(100% - 60px);
	}

	#close {
		position: absolute;
		width: 20px;
		height: 20px;
		left: 40px;
		top: 15px;

		background: #de4f4f;
		border-radius: 50%;
	}

	#close:hover {
		background: #f87878;
	}

	#window-content {
		position: relative;
		top: 50px;

		padding: 2em;
		height: calc(100% - 50px);
		box-sizing: border-box;
	}

	progress {
		width: 100%;
		height: 50px;
	}

	#text {
		font-size: 20px;
		font-family: system-ui;
		overflow-y: scroll;
		height: calc(100% - 50px);
		direction: rtl;
	}

	#credit {
		text-align: left;
		color: #b6abab;
	}
</style>
