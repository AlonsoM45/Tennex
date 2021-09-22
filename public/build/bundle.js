
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root.host) {
            return root;
        }
        return document;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_component(block) {
        block && block.c();
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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

    function expand(node, {delay = 0, duration = 300, totalHeight= 200}){
        return {
            duration,
            delay,
            css: t => {
                return `
                height: ${t*totalHeight}px;
                opacity: ${t*100}%;    
            `;
            }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const taskCount = writable(1);
    const allTasks = writable([]);
    const selectedTaskId = writable(-1);

    /* src\TopPanel.svelte generated by Svelte v3.41.0 */

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let b;
    	let t1;
    	let t2;
    	let t3;
    	let t4_value = /*selectedTask*/ ctx[1].name + "";
    	let t4;
    	let t5;
    	let textarea;
    	let textarea_value_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			b = element("b");
    			t1 = text("Editing Task #");
    			t2 = text(/*taskId*/ ctx[0]);
    			t3 = text(" : ");
    			t4 = text(t4_value);
    			t5 = space();
    			textarea = element("textarea");
    			attr(img, "class", "panel-header-button svelte-wype4k");
    			if (!src_url_equal(img.src, img_src_value = "../assets/chevron-up-white.png")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Hide Panel");
    			attr(div0, "class", "panel-header svelte-wype4k");
    			attr(textarea, "class", "purple-focus svelte-wype4k");
    			textarea.value = textarea_value_value = /*selectedTask*/ ctx[1].details;
    			attr(textarea, "placeholder", "details");
    			attr(div1, "class", "panel svelte-wype4k");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, img);
    			append(div0, t0);
    			append(div0, b);
    			append(b, t1);
    			append(b, t2);
    			append(b, t3);
    			append(b, t4);
    			append(div1, t5);
    			append(div1, textarea);

    			if (!mounted) {
    				dispose = [
    					listen(img, "click", /*hidePanel*/ ctx[2]),
    					listen(textarea, "input", /*changeDetails*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*taskId*/ 1) set_data(t2, /*taskId*/ ctx[0]);
    			if (dirty & /*selectedTask*/ 2 && t4_value !== (t4_value = /*selectedTask*/ ctx[1].name + "")) set_data(t4, t4_value);

    			if (dirty & /*selectedTask*/ 2 && textarea_value_value !== (textarea_value_value = /*selectedTask*/ ctx[1].details)) {
    				textarea.value = textarea_value_value;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let selectedTask;
    	let $allTasks;
    	let $selectedTaskId;
    	component_subscribe($$self, allTasks, $$value => $$invalidate(4, $allTasks = $$value));
    	component_subscribe($$self, selectedTaskId, $$value => $$invalidate(5, $selectedTaskId = $$value));
    	const dispatch = createEventDispatcher();
    	let { taskId } = $$props;

    	function hidePanel() {
    		set_store_value(selectedTaskId, $selectedTaskId = -1, $selectedTaskId);
    		dispatch('hide', {});
    	}

    	function changeDetails(event) {
    		set_store_value(allTasks, $allTasks[taskId].details = event.target.value, $allTasks);
    	} // ToDo: Check that this is changed in the file [LOW PRIORITY]

    	$$self.$$set = $$props => {
    		if ('taskId' in $$props) $$invalidate(0, taskId = $$props.taskId);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$allTasks, taskId*/ 17) {
    			 $$invalidate(1, selectedTask = $allTasks[taskId]);
    		}
    	};

    	return [taskId, selectedTask, hidePanel, changeDetails, $allTasks];
    }

    class TopPanel extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { taskId: 0 });
    	}
    }

    /* src\Task.svelte generated by Svelte v3.41.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (143:0) {#if !isRemoved}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let t3;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let b;
    	let t5;
    	let div0_class_value;
    	let t6;
    	let input;
    	let input_style_value;
    	let t7;
    	let div1_id_value;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*isExpandable*/ ctx[6]) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = !/*isCompleted*/ ctx[2] && create_if_block_2(ctx);
    	let if_block2 = /*isExpanded*/ ctx[4] && create_if_block_1(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			img0 = element("img");
    			t1 = space();
    			img1 = element("img");
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			img2 = element("img");
    			t4 = space();
    			b = element("b");
    			t5 = text(/*id*/ ctx[0]);
    			t6 = space();
    			input = element("input");
    			t7 = space();
    			if (if_block2) if_block2.c();
    			attr(img0, "class", "task-header-button skew-when-clicked svelte-151ls1w");
    			if (!src_url_equal(img0.src, img0_src_value = "../assets/plus-white.png")) attr(img0, "src", img0_src_value);
    			attr(img0, "alt", "Add New Task");
    			attr(img1, "class", "task-header-button skew-when-clicked svelte-151ls1w");
    			if (!src_url_equal(img1.src, img1_src_value = "../assets/pencil-white.png")) attr(img1, "src", img1_src_value);
    			attr(img1, "alt", "Edit Task");
    			attr(img2, "class", "task-header-button skew-when-clicked svelte-151ls1w");
    			if (!src_url_equal(img2.src, img2_src_value = "../assets/check-white.png")) attr(img2, "src", img2_src_value);
    			attr(img2, "alt", "Toggle Task Completion");

    			attr(div0, "class", div0_class_value = "task-header " + (/*isSelected*/ ctx[5]
    			? 'violet-background'
    			: /*isCompleted*/ ctx[2]
    				? 'green-background'
    				: /*isBlocked*/ ctx[3]
    					? 'red-background'
    					: 'neutral-background') + " svelte-151ls1w");

    			attr(input, "class", "task-title purple-focus svelte-151ls1w");
    			attr(input, "style", input_style_value = "width:" + (/*name*/ ctx[8].length + 2 + 'ch;'));
    			input.value = /*name*/ ctx[8];
    			attr(input, "onkeypress", "this.style.width = (this.value.length + 2) + 'ch';");
    			attr(div1, "id", div1_id_value = "task-card-" + /*id*/ ctx[0]);

    			attr(div1, "class", div1_class_value = "task-card " + (/*isSelected*/ ctx[5]
    			? 'violet-border'
    			: /*isCompleted*/ ctx[2]
    				? 'green-border'
    				: /*isBlocked*/ ctx[3] ? 'red-border' : 'neutral-border') + " svelte-151ls1w");

    			attr(div1, "draggable", "true");
    			attr(div1, "ondragover", "return false");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if_block0.m(div0, null);
    			append(div0, t0);
    			append(div0, img0);
    			append(div0, t1);
    			append(div0, img1);
    			append(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append(div0, t3);
    			append(div0, img2);
    			append(div0, t4);
    			append(div0, b);
    			append(b, t5);
    			append(div1, t6);
    			append(div1, input);
    			append(div1, t7);
    			if (if_block2) if_block2.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(img0, "click", /*addTask*/ ctx[10]),
    					listen(img1, "click", /*editTask*/ ctx[11]),
    					listen(img2, "click", /*toggleCompletion*/ ctx[16]),
    					listen(input, "input", /*changeName*/ ctx[13]),
    					listen(div1, "dragstart", handleDragStart),
    					listen(div1, "drop", stop_propagation(/*handleDragDrop*/ ctx[17]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			}

    			if (!/*isCompleted*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div0, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*id*/ 1) set_data(t5, /*id*/ ctx[0]);

    			if (!current || dirty & /*isSelected, isCompleted, isBlocked*/ 44 && div0_class_value !== (div0_class_value = "task-header " + (/*isSelected*/ ctx[5]
    			? 'violet-background'
    			: /*isCompleted*/ ctx[2]
    				? 'green-background'
    				: /*isBlocked*/ ctx[3]
    					? 'red-background'
    					: 'neutral-background') + " svelte-151ls1w")) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*name*/ 256 && input_style_value !== (input_style_value = "width:" + (/*name*/ ctx[8].length + 2 + 'ch;'))) {
    				attr(input, "style", input_style_value);
    			}

    			if (!current || dirty & /*name*/ 256 && input.value !== /*name*/ ctx[8]) {
    				input.value = /*name*/ ctx[8];
    			}

    			if (/*isExpanded*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*isExpanded*/ 16) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*id*/ 1 && div1_id_value !== (div1_id_value = "task-card-" + /*id*/ ctx[0])) {
    				attr(div1, "id", div1_id_value);
    			}

    			if (!current || dirty & /*isSelected, isCompleted, isBlocked*/ 44 && div1_class_value !== (div1_class_value = "task-card " + (/*isSelected*/ ctx[5]
    			? 'violet-border'
    			: /*isCompleted*/ ctx[2]
    				? 'green-border'
    				: /*isBlocked*/ ctx[3] ? 'red-border' : 'neutral-border') + " svelte-151ls1w")) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (159:8) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", "task-header-button skew-when-clicked svelte-151ls1w");
    			if (!src_url_equal(img.src, img_src_value = "../assets/cancel-white.png")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Remove Task");
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);

    			if (!mounted) {
    				dispose = listen(img, "click", /*removeTask*/ ctx[14]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(img);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (153:8) {#if isExpandable}
    function create_if_block_3(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*isExpanded*/ ctx[4]) return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (156:12) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", "task-header-button rotate-when-clicked svelte-151ls1w");
    			if (!src_url_equal(img.src, img_src_value = "../assets/chevron-down-white.png")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Expand Task");
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);

    			if (!mounted) {
    				dispose = listen(img, "click", /*toggleExpansion*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(img);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (154:12) {#if isExpanded}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", "task-header-button rotate-when-clicked svelte-151ls1w");
    			if (!src_url_equal(img.src, img_src_value = "../assets/chevron-up-white.png")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Minimize Task");
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);

    			if (!mounted) {
    				dispose = listen(img, "click", /*toggleExpansion*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(img);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (166:8) {#if !isCompleted}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", "task-header-button skew-when-clicked svelte-151ls1w");
    			if (!src_url_equal(img.src, img_src_value = "../assets/padlock-white.png")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Lock/Unlock Task");
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);

    			if (!mounted) {
    				dispose = listen(img, "click", /*toggleLockStatus*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(img);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (183:4) {#if isExpanded}
    function create_if_block_1(ctx) {
    	let div;
    	let current;
    	let each_value = /*children*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "task-space svelte-151ls1w");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*children, forwardEditTask*/ 4098) {
    				each_value = /*children*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (185:12) {#each children as childTaskId}
    function create_each_block(ctx) {
    	let task;
    	let current;
    	task = new Task({ props: { id: /*childTaskId*/ ctx[26] } });
    	task.$on("editTask", /*forwardEditTask*/ ctx[12]);

    	return {
    		c() {
    			create_component(task.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(task, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const task_changes = {};
    			if (dirty & /*children*/ 2) task_changes.id = /*childTaskId*/ ctx[26];
    			task.$set(task_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(task.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(task.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(task, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*isRemoved*/ ctx[7] && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!/*isRemoved*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isRemoved*/ 128) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function handleDragStart(e) {
    	e.dataTransfer.dropEffect = "move";
    	e.dataTransfer.setData("task-id", e.target.getAttribute('id'));
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let name;
    	let children;
    	let isExpanded;
    	let isRemoved;
    	let isCompleted;
    	let isBlocked;
    	let isExpandable;
    	let isSelected;
    	let $allTasks;
    	let $selectedTaskId;
    	let $taskCount;
    	component_subscribe($$self, allTasks, $$value => $$invalidate(18, $allTasks = $$value));
    	component_subscribe($$self, selectedTaskId, $$value => $$invalidate(19, $selectedTaskId = $$value));
    	component_subscribe($$self, taskCount, $$value => $$invalidate(20, $taskCount = $$value));
    	const dispatch = createEventDispatcher();
    	let { id } = $$props;

    	function toggleExpansion() {
    		set_store_value(allTasks, $allTasks[id].isExpanded = !isExpanded, $allTasks);
    	} // ToDo: Minimize children [LOW PRIORITY]

    	function addTask() {
    		let newTask = {
    			id: $taskCount,
    			name: "New Task",
    			parent: id,
    			children: [],
    			isExpanded: true,
    			isRemoved: false,
    			isCompleted: false,
    			isBlocked: false,
    			details: ""
    		};

    		// Update global tasks
    		taskCount.update(n => n + 1); // ToDo: Check synchronization issues [LOW PRIORITY]

    		$allTasks[id].children.push(newTask.id);
    		set_store_value(allTasks, $allTasks = [...$allTasks, newTask], $allTasks);

    		// Update children
    		$$invalidate(4, isExpanded = true);

    		// Un-complete if necessary
    		if (isCompleted) {
    			uncompleteTask(id);
    		}
    	}

    	function editTask() {
    		set_store_value(selectedTaskId, $selectedTaskId = id, $selectedTaskId);
    		dispatch('editTask', { id });
    	}

    	function forwardEditTask(editTaskEvent) {
    		dispatch('editTask', editTaskEvent.detail);
    	}

    	function changeName(event) {
    		set_store_value(allTasks, $allTasks[id].name = event.target.value, $allTasks);
    	} // ToDo: Check that this is changed in the file [LOW PRIORITY]

    	function removeTask() {
    		set_store_value(allTasks, $allTasks[id].isRemoved = true, $allTasks);
    	}

    	function toggleLockStatus() {
    		if (isBlocked) {
    			unblockTask(id);
    		} else {
    			blockTask(id);
    		}
    	}

    	function blockTask(id) {
    		set_store_value(allTasks, $allTasks[id].isBlocked = true, $allTasks);

    		for (let childId of $allTasks[id].children) {
    			blockTask(childId);
    		}
    	}

    	function unblockTask(id) {
    		set_store_value(allTasks, $allTasks[id].isBlocked = false, $allTasks);
    	}

    	function toggleCompletion() {
    		if (isCompleted) {
    			uncompleteTask(id);
    		} else {
    			completeTask(id);
    		}
    	}

    	function completeTask(id) {
    		set_store_value(allTasks, $allTasks[id].isCompleted = true, $allTasks);
    		set_store_value(allTasks, $allTasks[id].isBlocked = false, $allTasks);

    		for (let childId of $allTasks[id].children) {
    			completeTask(childId);
    		}
    	}

    	function uncompleteTask(id) {
    		set_store_value(allTasks, $allTasks[id].isCompleted = false, $allTasks);

    		if ($allTasks[id].parent != null) {
    			uncompleteTask($allTasks[id].parent);
    		}
    	}

    	function handleDragDrop(e) {
    		e.preventDefault();
    		let elementId = e.dataTransfer.getData("task-id");
    		let droppedTaskId = parseInt(elementId.substring(10, elementId.length)); // 10 is the length of "task-card-"

    		if (id != droppedTaskId) {
    			// Add new children
    			$allTasks[id].children.push(droppedTaskId);

    			// Remove old children
    			let parentId = $allTasks[droppedTaskId].parent;

    			$allTasks[parentId].children.splice($allTasks[parentId].children.indexOf(droppedTaskId), 1);

    			// Re-assign children to force update
    			allTasks.set($allTasks);

    			allTasks.set($allTasks);

    			// Change parent
    			set_store_value(allTasks, $allTasks[droppedTaskId].parent = id, $allTasks);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$allTasks, id*/ 262145) {
    			 $$invalidate(8, name = $allTasks[id].name);
    		}

    		if ($$self.$$.dirty & /*$allTasks, id*/ 262145) {
    			 $$invalidate(1, children = $allTasks[id].children);
    		}

    		if ($$self.$$.dirty & /*$allTasks, id*/ 262145) {
    			 $$invalidate(4, isExpanded = $allTasks[id].isExpanded);
    		}

    		if ($$self.$$.dirty & /*$allTasks, id*/ 262145) {
    			 $$invalidate(7, isRemoved = $allTasks[id].isRemoved);
    		}

    		if ($$self.$$.dirty & /*$allTasks, id*/ 262145) {
    			 $$invalidate(2, isCompleted = $allTasks[id].isCompleted);
    		}

    		if ($$self.$$.dirty & /*$allTasks, id*/ 262145) {
    			 $$invalidate(3, isBlocked = $allTasks[id].isBlocked);
    		}

    		if ($$self.$$.dirty & /*children, $allTasks*/ 262146) {
    			 $$invalidate(6, isExpandable = children.filter(childId => {
    				console.log(childId); // ToDo: Remove
    				return !$allTasks[childId].isRemoved;
    			}).length > 0);
    		}

    		if ($$self.$$.dirty & /*$selectedTaskId, id*/ 524289) {
    			 $$invalidate(5, isSelected = $selectedTaskId == id);
    		}
    	};

    	return [
    		id,
    		children,
    		isCompleted,
    		isBlocked,
    		isExpanded,
    		isSelected,
    		isExpandable,
    		isRemoved,
    		name,
    		toggleExpansion,
    		addTask,
    		editTask,
    		forwardEditTask,
    		changeName,
    		removeTask,
    		toggleLockStatus,
    		toggleCompletion,
    		handleDragDrop,
    		$allTasks,
    		$selectedTaskId
    	];
    }

    class Task extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 0 });
    	}
    }

    /* src\App.svelte generated by Svelte v3.41.0 */

    function create_if_block$1(ctx) {
    	let div;
    	let toppanel;
    	let div_intro;
    	let div_outro;
    	let current;

    	toppanel = new TopPanel({
    			props: {
    				isOpen: /*isTopPanelOpen*/ ctx[0],
    				taskId: /*selectedTaskId*/ ctx[1]
    			}
    		});

    	toppanel.$on("hide", /*closeTaskDetails*/ ctx[3]);

    	return {
    		c() {
    			div = element("div");
    			create_component(toppanel.$$.fragment);
    			set_style(div, "height", "200px");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(toppanel, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const toppanel_changes = {};
    			if (dirty & /*isTopPanelOpen*/ 1) toppanel_changes.isOpen = /*isTopPanelOpen*/ ctx[0];
    			if (dirty & /*selectedTaskId*/ 2) toppanel_changes.taskId = /*selectedTaskId*/ ctx[1];
    			toppanel.$set(toppanel_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(toppanel.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, expand, { totalHeight: 200 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(toppanel.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, expand, { totalHeight: 200 });
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(toppanel);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let t;
    	let div;
    	let task;
    	let current;
    	let if_block = /*isTopPanelOpen*/ ctx[0] && create_if_block$1(ctx);
    	task = new Task({ props: { id: 0 } });
    	task.$on("editTask", /*openTaskDetails*/ ctx[2]);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			create_component(task.$$.fragment);
    			attr(div, "class", "task-panel svelte-1qbmnin");
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);
    			insert(target, div, anchor);
    			mount_component(task, div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*isTopPanelOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isTopPanelOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(task.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(task.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t);
    			if (detaching) detach(div);
    			destroy_component(task);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $allTasks;
    	component_subscribe($$self, allTasks, $$value => $$invalidate(5, $allTasks = $$value));
    	const { app } = require('electron').remote; // ToDo: This is suppossed to be unsafe, maybe do it with IPC
    	const fs = window.require('fs');
    	let tasksFilename = app.getPath('userData') + "/tasks.json";
    	let oldTasksFilename = app.getPath('userData') + "/old-tasks.json";
    	let isTopPanelOpen = false;
    	let selectedTaskId = 0;
    	let dataHasChanged = false;

    	let firstTask = {
    		id: 0,
    		name: "First Task",
    		children: [],
    		isExpanded: true,
    		isRemoved: false,
    		isCompleted: false,
    		isBlocked: false,
    		details: ""
    	};

    	set_store_value(allTasks, $allTasks = [firstTask], $allTasks);

    	function openTaskDetails(event) {
    		$$invalidate(1, selectedTaskId = event.detail.id);
    		$$invalidate(0, isTopPanelOpen = true);
    	}

    	function closeTaskDetails() {
    		$$invalidate(1, selectedTaskId = 0);
    		$$invalidate(0, isTopPanelOpen = false);
    	}

    	fs.readFile(tasksFilename, 'utf-8', (err, data) => {
    		if (err) {
    			console.log(err);
    			alert("An error ocurred reading the file :" + err.message);
    		} else {
    			try {
    				let allData = JSON.parse(data);
    				taskCount.set(allData.length);
    				allTasks.set(allData);
    				console.log("Assigned:", allData);
    				fs.writeFileSync(oldTasksFilename, JSON.stringify(allData));
    			} catch(error) {
    				console.log("Error while parsing tasks:" + error);
    			}
    		}

    		const unsuscribeToAllTasks = allTasks.subscribe(tasksArray => {
    			dataHasChanged = true;
    		});
    	});

    	function writeAllTasks() {
    		let tasksArray = $allTasks;

    		try {
    			fs.writeFileSync(tasksFilename, JSON.stringify(tasksArray));
    			dataHasChanged = false;
    			console.log("Writing...");
    		} catch(e) {
    			console.log(e);
    			alert('Failed to save the file!');
    		}
    	}

    	function writeAllTasksIfNeeded() {
    		if (dataHasChanged) {
    			writeAllTasks();
    		}
    	}

    	setInterval(writeAllTasksIfNeeded, 10000);
    	return [isTopPanelOpen, selectedTaskId, openTaskDetails, closeTaskDetails];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
