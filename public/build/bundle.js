
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    const progress_val = tweened(0);
    const progress_max = writable(0);
    const opacity = writable(1);
    const visibility = writable("visible");
    let stop_function = {
        v: false
    };
    window["s"] = stop_function;

    function my_console_log(txt) {
        console.log(txt);
        const my_console = document.querySelector("#text");
        my_console.innerText += txt + "\n";
        my_console.scrollTo({
            top: my_console.scrollHeight,
            behavior: "smooth"
        });
    }

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0)
            return '0 Byte';
        var i = Math.trunc(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }

    function format(fmt) {
      var re = /(%?)(%([jds]))/g
        , args = Array.prototype.slice.call(arguments, 1);
      if(args.length) {
        fmt = fmt.replace(re, function(match, escaped, ptn, flag) {
          var arg = args.shift();
          switch(flag) {
            case 's':
              arg = '' + arg;
              break;
            case 'd':
              arg = Number(arg);
              break;
            case 'j':
              arg = JSON.stringify(arg);
              break;
          }
          if(!escaped) {
            return arg; 
          }
          args.unshift(arg);
          return match;
        });
      }

      // arguments remain after formatting
      if(args.length) {
        fmt += ' ' + args.join(' ');
      }

      // update escaped %% values
      fmt = fmt.replace(/%{2,2}/g, '%');

      return '' + fmt;
    }

    var format_1 = format;

    const lang_text = {
        is_download_file: "מוריד את קובץ %s...",
        zipping_file: "דוחס את קובץ %s...",
        ready: "הקובץ מוכן להורדה!",
        download: "מקובץ %s ירדו %s מתוך %s",
        is_not_site: "אתר זה, איננו " + "jewishmusic.fm!",
        empty_audio: "בדף זה, אין קבצי אודיו!"
    };

    function download_song(song, reply = 0) {
        let res;
        const promise = new Promise(async (resolve, reason) => {
            res = fetch(song.url, {
                headers: {
                    "Range": "bytes=0-"
                }
            });
            const response = await res;
            if (response.status < 200 || response.status >= 400) {
                if (reply < 5) {
                    reply++;
                    my_console_log("!!!");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    resolve(download_song(song, reply));
                }
                else {
                    reason();
                    throw response;
                }
            }
            const reader = response.body.getReader();
            const contentLength = response.headers.get('Content-Length');
            let receivedLength = 0;
            const stream = new Response(new ReadableStream({
                async start(controller) {
                    const interval = setInterval(() => {
                        my_console_log(format_1(lang_text.download, song.file_name, bytesToSize(receivedLength), bytesToSize(contentLength)));
                    }, 1000);
                    while (true) {
                        if (stop_function.v) {
                            clearInterval(interval);
                            controller.close();
                            throw new Error("window closed!");
                        }
                        const { done, value } = await reader.read();
                        if (done) {
                            clearInterval(interval);
                            break;
                        }
                        receivedLength += value.length;
                        controller.enqueue(value);
                    }
                    controller.close();
                }
            }));
            const blob = await stream.blob();
            resolve(blob);
        });
        return promise;
    }

    function get_all_songs() {
        const song_list = document.
            querySelectorAll("audio > source");
        let song_list_arr = Array.from(song_list);
        const final_songs_arr = Array();
        song_list_arr.forEach((source) => {
            final_songs_arr.push({
                url: source.src.replace("http://", "https://"),
                file_name: source.parentElement.
                    parentElement.querySelector("h3").innerText
            });
        });
        return final_songs_arr;
    }
    async function download_all_songs() {
        const audio_list = get_all_songs();
        let zip = new window["JSZip"]();
        progress_max.set(audio_list.length);
        let i = 0;
        for (const song of audio_list) {
            if (stop_function.v) {
                throw new Error("window closed!");
            }
            my_console_log(format_1(lang_text.is_download_file, song.file_name));
            const blob = await download_song(song);
            my_console_log(format_1(lang_text.zipping_file, song.file_name));
            const ext = song.url.split(".").pop();
            zip.file(song.file_name + "." + ext, blob, { binary: true });
            i++;
            progress_val.set(i);
        }
        my_console_log(format_1(lang_text.ready));
        await save_zip_file(zip);
    }
    async function save_zip_file(zip) {
        const albom_title = document.querySelector(".album-title").innerText, albom_art = document.querySelector(".arts_name").innerText, file_name = `${albom_title} - ${albom_art}`;
        const zipFile = await zip.generateAsync({ type: "blob" });
        save_blob_file(zipFile, file_name);
    }
    async function save_blob_file(blob, file_name) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = file_name || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function my_require(url) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.head.appendChild(script);
        await new Promise((resolve) => script.onload = resolve);
    }

    const the_div = document.createElement("div");
    the_div.classList.add("app");
    document.body.appendChild(the_div);

    function close() {
        stop_function.v = true;
        opacity.set(0);
        visibility.set("hidden");
        setTimeout(() => {
            the_div.remove();
        }, 3 * 1000);
    }

    function check() {
        const audio_list = document.querySelectorAll("audio > source");
        if (window.location.hostname !== "jewishmusic.fm") {
            throw new Error(lang_text.is_not_site);
        }
        if (audio_list.length < 1) {
            throw new Error(lang_text.empty_audio);
        }
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-rmhjxh-style";
    	style.textContent = "#window.svelte-rmhjxh{position:fixed;left:10%;right:10%;top:20%;bottom:20%;max-width:660px;margin:auto;backdrop-filter:blur(8px);border-radius:30px;background:rgba(255, 255, 255, 0.73);box-shadow:0px 0px 13px 1px;transition:all 3s ease-out;z-index:20}#bar.svelte-rmhjxh{position:absolute;height:50px;left:0;right:0;background:#7c7c7c;border-radius:30px 30px 0px 0px}#window-text.svelte-rmhjxh{height:100%;display:flex;align-items:center;justify-content:space-around;text-align:center;font-size:24px;line-height:28px;color:#ececec;font-family:system-ui;position:relative;width:calc(100% - 60px)}#close.svelte-rmhjxh{position:absolute;width:20px;height:20px;left:40px;top:15px;background:#de4f4f;border-radius:50%}#close.svelte-rmhjxh:hover{background:#f87878}#window-content.svelte-rmhjxh{position:relative;top:50px;padding:2em;height:calc(100% - 50px);box-sizing:border-box}progress.svelte-rmhjxh{width:100%;height:50px}#text.svelte-rmhjxh{font-size:20px;font-family:system-ui;overflow-y:scroll;height:calc(100% - 50px);direction:rtl}#credit.svelte-rmhjxh{text-align:left;color:#b6abab}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,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 */";
    	append_dev(document.head, style);
    }

    function create_fragment(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div5;
    	let progress;
    	let t3;
    	let div3;
    	let t4;
    	let div4;
    	let a;
    	let em;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "הורדה מאתר Jewish-music.Fm";
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div5 = element("div");
    			progress = element("progress");
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			div4 = element("div");
    			a = element("a");
    			em = element("em");
    			em.textContent = "MusiCode";
    			attr_dev(div0, "id", "window-text");
    			attr_dev(div0, "class", "svelte-rmhjxh");
    			add_location(div0, file, 6, 2, 236);
    			attr_dev(div1, "id", "close");
    			attr_dev(div1, "class", "svelte-rmhjxh");
    			add_location(div1, file, 7, 2, 294);
    			attr_dev(div2, "id", "bar");
    			attr_dev(div2, "class", "svelte-rmhjxh");
    			add_location(div2, file, 5, 1, 218);
    			progress.value = /*$progress_val*/ ctx[2];
    			attr_dev(progress, "max", /*$progress_max*/ ctx[3]);
    			attr_dev(progress, "class", "svelte-rmhjxh");
    			add_location(progress, file, 11, 2, 372);
    			attr_dev(div3, "id", "text");
    			attr_dev(div3, "class", "svelte-rmhjxh");
    			add_location(div3, file, 13, 2, 432);
    			add_location(em, file, 16, 4, 547);
    			attr_dev(a, "href", "https://github.com/MusiCode1/jewish-music.fm");
    			attr_dev(a, "target", "_");
    			add_location(a, file, 15, 3, 475);
    			attr_dev(div4, "id", "credit");
    			attr_dev(div4, "class", "svelte-rmhjxh");
    			add_location(div4, file, 14, 2, 453);
    			attr_dev(div5, "id", "window-content");
    			attr_dev(div5, "class", "svelte-rmhjxh");
    			add_location(div5, file, 10, 1, 343);
    			attr_dev(div6, "id", "window");
    			set_style(div6, "visibility", /*$visibility*/ ctx[0]);
    			set_style(div6, "opacity", /*$opacity*/ ctx[1]);
    			attr_dev(div6, "class", "svelte-rmhjxh");
    			add_location(div6, file, 4, 0, 143);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, progress);
    			append_dev(div5, t3);
    			append_dev(div5, div3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, em);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", close, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$progress_val*/ 4) {
    				prop_dev(progress, "value", /*$progress_val*/ ctx[2]);
    			}

    			if (dirty & /*$progress_max*/ 8) {
    				attr_dev(progress, "max", /*$progress_max*/ ctx[3]);
    			}

    			if (dirty & /*$visibility*/ 1) {
    				set_style(div6, "visibility", /*$visibility*/ ctx[0]);
    			}

    			if (dirty & /*$opacity*/ 2) {
    				set_style(div6, "opacity", /*$opacity*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $visibility;
    	let $opacity;
    	let $progress_val;
    	let $progress_max;
    	validate_store(visibility, "visibility");
    	component_subscribe($$self, visibility, $$value => $$invalidate(0, $visibility = $$value));
    	validate_store(opacity, "opacity");
    	component_subscribe($$self, opacity, $$value => $$invalidate(1, $opacity = $$value));
    	validate_store(progress_val, "progress_val");
    	component_subscribe($$self, progress_val, $$value => $$invalidate(2, $progress_val = $$value));
    	validate_store(progress_max, "progress_max");
    	component_subscribe($$self, progress_max, $$value => $$invalidate(3, $progress_max = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		progress_val,
    		progress_max,
    		opacity,
    		visibility,
    		close,
    		$visibility,
    		$opacity,
    		$progress_val,
    		$progress_max
    	});

    	return [$visibility, $opacity, $progress_val, $progress_max];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-rmhjxh-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    (async () => {
        try {
            console.log("Musicode7");
            console.log("https://github.com/MusiCode1/jewish-music.fm");
            check();
            await my_require("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js");
            new App({
                target: the_div
            });
            download_all_songs().finally(() => {
                close();
            });
        }
        catch (error) {
            if (error.massage === "window closed!") {
                console.log(error.massage);
                throw error;
            }
            else {
                alert(error);
                throw error;
            }
        }
    })();

}());
//# sourceMappingURL=bundle.js.map
