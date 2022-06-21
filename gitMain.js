const canvas = document.querySelector('canvas');
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


class Color
{
    constructor(r = Math.random() * 255, g = Math.random() * 255, b = Math.random() * 255, t = 1.0)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.t = t;
    }

    get_str ()
    {
        return "rgb(" + String(this.r) + "," + String(this.g) + "," + String(this.b) + "," + String(this.t) + ")";
    }
}

class Rect
{
    constructor(x1, y1, x2, y2, radius, color)
    {
        this.x1 = x1;
        this.x2 = x2
        this.y1 = y1;
        this.y2 = y2;
        this.radius = radius;
        this.color = color;

        this.time = Date.now();
    }

    draw(fade_time)
    {
        
        this.color.t = 1 - (((Date.now() - this.time) / 1.0e3) / fade_time);
        
        c.beginPath();
        c.strokeStyle = this.color.get_str();
        c.moveTo(this.x1, this.y1);
        c.lineTo(this.x2,this.y2);
        c.lineWidth = this.radius;
        c.stroke();
        c.closePath();
        
        if (this.color.t < 0.0) return 1;
        if (this.x1 > innerWidth || this.x1 < 0) return 2;
        return 0;
    }
}


class Particle
{
    constructor(x, y, y_speed, x_speed, color, radius)
    {
        this.x = x;
        this.y = y;

        this.last_x = x;
        this.last_y = y;


        this.x_speed = x_speed;
        this.y_speed = y_speed;
        this.color = color;
        this.radius = radius;

        this.start_time = Date.now();
        this.last_calc_time = Date.now();
    
        this.accel = 9.82 * 100;


        this.rectangles = [];
    }

    bounce()
    {
        const friction_loss = 0.85;

        let current_time = Date.now();
        let delta_loop = (current_time - this.last_calc_time) / 1.0e3;
        this.last_calc_time = current_time;

        this.y_speed += this.accel * delta_loop;

        this.x += this.x_speed * delta_loop;
        this.y += this.y_speed * delta_loop;

        if (this.y >= innerHeight - this.radius)
        {
            this.y_speed = -this.y_speed * friction_loss;
            this.y = innerHeight - this.radius;
        }
    }

    draw(fade_time)
    {
        this.rectangles.push(new Rect(this.x, this.y, this.last_x, this.last_y, this.radius, this.color));
        this.last_x = this.x;
        this.last_y = this.y;

        let remove_start = 0;
        let finsihed_start = false;
        for (let i = 0; i < this.rectangles.length; i++)
        {
            let rtn = this.rectangles[i].draw(fade_time);
            if (rtn && !finsihed_start)
            {
                remove_start = i;
            }
            else 
            {
                finsihed_start = true;
            }
        }
        
        this.rectangles.splice(0, remove_start);
    }
}



let particles = [];

function rand(n = 1)
{
    return Math.random() * n - (n/2);
}

document.addEventListener("click", function(event) 
{
    for (let i = 0; i < 10; i++)
    {
        particles.push(new Particle(event.x, event.y, rand(2000), rand(400), new Color(), rand(20)));
    }
})

document.addEventListener("touchclick", function(event) 
{
    for (let i = 0; i < 10; i++)
    {
        particles.push(new Particle(event.x, event.y, rand(2000), rand(400), new Color(), rand(20)));
    }
})


function animate()
{
    c.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particles.length; i++)
    {
        particles[i].bounce();
        particles[i].draw(2.0);
    }

    let remove_indx = 0;
    for (let i = 0; i < particles.length; i++)
    {
        if ((Date.now() - particles[i].start_time) / 1.0e3 > 15.0)
        {
            remove_indx = i + 1;
        }
    }
    particles.splice(0, remove_indx);

    requestAnimationFrame(animate);
}
animate();